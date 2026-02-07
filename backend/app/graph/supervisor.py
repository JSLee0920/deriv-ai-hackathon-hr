from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from .state import AgentState
from .nodes import extract_data_node, contract_drafting_node

load_dotenv()

workflow = StateGraph(AgentState)

workflow.add_node("extractor", extract_data_node)
workflow.add_node("drafter", contract_drafting_node)

workflow.set_entry_point("extractor")
workflow.add_edge("extractor", "drafter")
workflow.add_edge("drafter", END)

app = workflow.compile()