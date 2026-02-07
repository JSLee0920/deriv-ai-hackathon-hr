from typing import TypedDict, Annotated, List, Dict, Optional
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    contract_data: Dict  # Will store the JSON from frontend
    final_document: str  # Stores the generated contract
    rag_context: Optional[str] # Stores the RAG context used