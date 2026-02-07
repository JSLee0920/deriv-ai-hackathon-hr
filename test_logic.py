import json
from langchain_core.messages import HumanMessage
from backend.app.graph.supervisor import app

# Pull frontend field here
frontend_payload = {
  "document_type": "Employment Contract",
  "location": "Malaysia",                  
  "employee_name": "Hariz",                
  "role": "AI Architect",                  
  "department": "Engineering",
  "start_date": "2026-03-01",
  "salary": "RM 12,000",
  "address": "456 Tech Lane, Cyberjaya, Malaysia",
  "additional_clauses": "1. Flexible working hours allowed.\n2. Access to GPU cluster for research."
}

print(">>> Sending Full Form Data...")
result = app.invoke({"messages": [HumanMessage(content=json.dumps(frontend_payload))]})

print("\n>>> Final Document Preview:\n")
print(result['final_document'])