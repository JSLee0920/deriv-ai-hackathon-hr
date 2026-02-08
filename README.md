# AetherHR: AI-Powered HR Operations

AetherHR is an intelligent, agentic HR operations platform designed to transform HR from a bottleneck into a strategic asset by automating documents / contracts generation and providing HR conversational assistant for handling FAQS from employees.
Developed for the Deriv AI Hackathon.

### Tech Stack

- Python & FastAPI
- Next.js
- LangChain & LangGraph
- ChromaDB
- HuggingFace Embeddings

### Backend Setup (AI & Database)

Install the Python Libraries Required

```
cd scripts

pip install -r requirements.txt

```

In the backend folder, create .env file with the following:

```
# PostgreSql database which will be used later
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/mydb?schema=public"

# Gemini API Key
GOOGLE_API_KEY="your_api_key"

```

Sync the database schema and generate the Python client

```

python -m prisma db push
python -m prisma generate

```

### Frontend Setup

```

cd frontend

# Install dependencies

npm install

```

### Running the Application

Backend

```
cd backend
uvicorn app.main.app --reload

```

Frontend

```
cd frontend
npm run dev

```
