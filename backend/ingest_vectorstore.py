import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Set up paths and vectorstore
hr_policies_dir = "../hr_policies"
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vectorstore = Chroma(persist_directory="backend/chroma_db", embedding_function=embeddings)

# 2. Collect all PDF files in hr_policies_dir
pdf_files = [os.path.join(hr_policies_dir, f) for f in os.listdir(hr_policies_dir) if f.endswith(".pdf")]

all_chunks = []
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

for pdf_path in pdf_files:
    print(f"Loading {pdf_path}...")
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    chunks = splitter.split_documents(docs)
    all_chunks.extend(chunks)
    
# 3. Add all chunks to ChromaDB
if all_chunks:
    vectorstore.add_documents(all_chunks)
    print(f"Ingested {len(all_chunks)} chunks from {len(pdf_files)} PDF(s).")
else:
    print("No documents found to ingest.")