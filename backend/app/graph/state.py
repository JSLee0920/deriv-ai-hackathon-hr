from typing import TypedDict, Annotated, List, Dict
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    contract_data: Dict  # Will store the JSON from frontend
    final_document: str  # Stores the generated contract