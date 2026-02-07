import os
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

def ingest_pdf_resources():
    folders = ["hr_policies", "labour-laws"]
    CHROMA_PATH = "backend/chroma_db"
    
    loader_settings = {"glob": "*.pdf", "loader_cls": PyPDFLoader}
    all_docs = []
    
    for folder in folders:
        print(f"Ingesting: {folder}")
        
        path = os.path.join("..", folder)
        if not os.path.exists(path):
            print(f"Warning: Folder {path} not found.")
            continue
        
        loader = DirectoryLoader(path, **loader_settings)
        all_docs.extend(loader.load())
    
    if not all_docs:
        print("No documents found to ingest.")
        return
    
    # Splits the documents into smaller chunks for RAG
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = splitter.split_documents(all_docs)
    print(f"Total chunks created: {len(chunks)}")
    
    # Initialize embeddings and vector store
    model_name = "BAAI/bge-small-en-v1.5"
    model_kwargs = {'device': 'cpu'}
    encode_kwargs = {'normalize_embeddings': True}
    
    embeddings = HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs=model_kwargs,
        encode_kwargs=encode_kwargs
    )
    
    # Create and persist the vector store
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )
    
    print("vector store created and persisted successfully.")
    
if __name__ == "__main__":
    ingest_pdf_resources()
    
    