import os
import re
from dotenv import load_dotenv

load_dotenv()

from langchain_core.messages import AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain_community.document_loaders import PyPDFLoader
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

# RAG
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vectorstore = Chroma(persist_directory="backend/chroma_db", embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})


class ContractDetails(BaseModel):
    document_type: str = Field(description="The type of document (e.g. Employment Contract, NDA)", default="Employment Contract")
    employee_name: str = Field(description="Name of the employee")
    role: str = Field(description="Position title")
    department: str = Field(description="Department", default="")
    salary: str = Field(description="Monthly salary", default="")
    start_date: str = Field(description="Start date", default="")
    location: str = Field(description="Country (Malaysia, Singapore, Hong Kong)")
    address: str = Field(description="Residential address", default="")
    additional_clauses: str = Field(description="Custom clauses", default="")

# Clean PDF Text
def clean_pdf_text(text):
    text = re.sub(r"This sample document is provided.*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"Page \d+ of \d+", "", text)
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def get_template_text(location, doc_type):
    # Normalize inputs
    loc_key = location.lower().replace(" ", "-")
    doc_key = doc_type.lower()
    
    # Determine Keywords based on Document Type
    keywords = []
    if "contract" in doc_key:
        keywords = ["contract", "agreement", "employment"]
    elif "nda" in doc_key or "disclosure" in doc_key:
        keywords = ["nda", "confidentiality", "disclosure"]
    elif "resignation" in doc_key:
        keywords = ["resignation", "termination"]
    elif "offer" in doc_key:
        keywords = ["offer", "appointment"]
    else:
        keywords = [doc_key] # Fallback: search for the exact word

    # Locate Folder
    base_path = "hr-templates"
    if "malaysia" in loc_key: target_folder = os.path.join(base_path, "malaysia")
    elif "singapore" in loc_key: target_folder = os.path.join(base_path, "singapore")
    elif "hong" in loc_key: target_folder = os.path.join(base_path, "hong-kong")
    else: target_folder = os.path.join(base_path, loc_key)
    
    found_text = ""
    
    # Search for Matching Files
    if os.path.exists(target_folder):
        print(f"--- [SYSTEM] Searching in {target_folder} for keywords: {keywords} ---")
        files = os.listdir(target_folder)
        
        target_file = None
        for f in files:
            if any(k in f.lower() for k in keywords) and (f.endswith(".pdf") or f.endswith(".md")):
                target_file = f
                break
        
        if target_file:
            print(f"--- [SYSTEM] Found Template: {target_file} ---")
            full_path = os.path.join(target_folder, target_file)
            
            if target_file.endswith(".md"):
                with open(full_path, "r", encoding="utf-8") as file:
                    found_text = file.read()
            else:
                loader = PyPDFLoader(full_path)
                pages = loader.load()
                found_text = "\n".join([clean_pdf_text(p.page_content) for p in pages])
        else:
            print(f"--- [WARNING] No file matched keywords {keywords} in {target_folder} ---")

    return found_text if found_text else None

# Extractor
def extract_data_node(state):
    print("--- [NODE] Extractor: Processing Frontend Input... ---")
    last_msg = state['messages'][-1].content
    structured_llm = llm.with_structured_output(ContractDetails)
    prompt_text = f"Extract details from: {last_msg}"
    extracted_data = structured_llm.invoke(prompt_text)
    return {"contract_data": extracted_data.model_dump()}

# Drafter
def contract_drafting_node(state):
    print("--- [NODE] Drafter: Writing Document... ---")
    data = state['contract_data']
    location = data.get("location", "Malaysia")
    doc_type = data.get("document_type", "Employment Contract")
    
    template_content = get_template_text(location, doc_type)
    
    if not template_content:
        template_content = f"Standard {doc_type} Template."

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert HR Lawyer. Rewrite the provided Template into a professional document.\n"
                   "RULES:\n"
                   "1. **Format:** Output clean MARKDOWN (use ## for headers).\n"
                   "2. **Context:** You are writing a {doc_type}.\n"
                   "3. **Fill Details:** Use the Data provided. If a field (like Salary) is irrelevant for this document type (like an NDA), ignore it.\n"
                   "4. **Custom Clauses:** If 'additional_clauses' are present, append them as '## Special Terms'.\n"),
        ("human", "DATA:\n{data_input}\n\nTEMPLATE SOURCE:\n{template_input}")
    ])
    
    chain = prompt | llm
    
    result = chain.invoke({
        "doc_type": doc_type,
        "data_input": str(data),
        "template_input": template_content
    })
    
    return {
        "final_document": result.content,
        "messages": [AIMessage(content=f"{doc_type} generated for {data['employee_name']}.")]
    }
    
def router_node(state):
    # Branches logic based on user intent.
    last_msg = state['messages'][-1].content.lower()
    if any(k in last_msg for k in ["generate", "contract", "nda"]):
        return "extractor"
    return "assistant"

# HR Assistant
def assistant_node(state):
    query = state['messages'][-1].content
    docs = retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])
    
    prompt = f"""
    You are the AetherHR Assistant. You are responsible for providing 
    accurate, compliant, and professional guidance on regional labour laws 
    (Malaysia, Singapore, Hong Kong) and internal company policies.
    
    GUIDELINES:
    - Use ONLY the context provided below. 
    - If the context doesn't contain the answer, say: "I'm sorry, I don't have that specific policy information in my current records."
    - Maintain a professional and helpful tone.
    
    CONTEXT:
    {context}
    
    USER QUERY: {query}
    """
    
    response = llm.invoke(prompt)
    return {"messages": [AIMessage(content=response.content)], "rag_context": context}


    