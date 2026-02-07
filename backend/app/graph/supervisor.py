from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from .state import AgentState
from .nodes import extract_data_node, contract_drafting_node, assistant_node, router_node

load_dotenv()

workflow = StateGraph(AgentState)

workflow.add_node("extractor", extract_data_node)
workflow.add_node("drafter", contract_drafting_node)
workflow.add_node("assistant", assistant_node)

workflow.add_conditional_edges(
    START, 
    router_node, 
    {"extractor": "extractor", "assistant": "assistant"}
)

workflow.set_entry_point("extractor")
workflow.add_edge("extractor", "drafter")
workflow.add_edge("drafter", END)
workflow.add_edge("assistant", END)

app = workflow.compile()