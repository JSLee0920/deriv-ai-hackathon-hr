from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vectorstore = Chroma(persist_directory="backend/chroma_db",
                     embedding_function=embeddings)

# Get all documents (if supported)
# Use for testing if chroma has loaded documents
# Run this file directly in the terminal to see the count
# If don't have, run the ingestion script to load documents first
try:
    collection = vectorstore._collection
    count = collection.count()
    print(f"Total documents in vectorstore: {count}")
except Exception as e:
    print("Could not count documents:", e)
