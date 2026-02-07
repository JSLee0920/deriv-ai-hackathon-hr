from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from .graph.supervisor import app as hr_graph
from typing import Optional

app = FastAPI(
    title="AetherHR API Gateway",
    description="Backend for HR Assistant (RAG) and Intelligent Document Generation"
)

class ChatRequest(BaseModel):
    message: str
    
class DocRequest(BaseModel):
    document_type: str
    employee_name: str
    location: str
    role: Optional[str] = ""
    department: Optional[str] = ""
    salary: Optional[str] = ""
    start_date: Optional[str] = ""
    address: Optional[str] = ""
    additional_clauses: Optional[str] = ""
    
# HR Assistant Endpoint
@app.post("/api/assistant")
async def handle_assistant(request: ChatRequest):
    try:
        inputs = {"messages": [HumanMessage(content=request.message)]}
        
        result = await hr_graph.ainvoke(inputs)
        
        # Return the AI's response (last message in the state)
        return {
            "answer": result["messages"][-1].content,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Document Generation Endpoint
@app.post("/api/generate")
async def handle_document_generation(request: DocRequest):
    try:
        # Convert Pydantic model to dict for the graph state
        form_data = request.model_dump()
        
        # Construct the initial state
        inputs = {
            "messages": [HumanMessage(content=f"Generate {request.document_type} for {request.employee_name}")],
            "contract_data": form_data
        }
        
        # Run the graph
        result = await hr_graph.ainvoke(inputs)
        
        # Return the drafted Markdown document
        if "final_document" in result:
            return {
                "document": result["final_document"],
                "status": "success"
            }
        else:
            raise HTTPException(status_code=500, detail="Document generation failed to produce content.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Health Check Endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "online", "model": "gemini-2.5-flash"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
