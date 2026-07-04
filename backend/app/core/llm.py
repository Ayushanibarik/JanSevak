import httpx
from typing import Dict, Any, Optional

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"

async def generate_civic_entities(text: str) -> Optional[Dict[str, Any]]:
    """
    Uses Local Llama 3 via Ollama to perform custom NER on incoming complaints.
    Extracts structured entities without external API costs.
    """
    prompt = f"""
    You are a civic intelligence agent analyzing a complaint from a citizen in India.
    Extract the following entities from the text and return ONLY JSON format:
    - category (Water, Roads, Sanitation, Health, Electricity)
    - priority (High, Medium, Low)
    - sentiment (Negative, Neutral, Positive)
    
    Complaint Text: {text}
    """
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("response")
            return None
    except Exception as e:
        print(f"Ollama Llama 3 Error: {e}")
        return None

async def ask_rag_assistant(question: str, db_context_docs: list) -> Optional[str]:
    """
    RAG Implementation: Takes an official's natural language query and 
    database records (context), and summarizes the answer using Llama 3.
    """
    context_str = "\n".join([str(doc) for doc in db_context_docs])
    prompt = f"""
    You are an AI assistant for government officials. Answer their question based ONLY on the following database records.
    
    Database Records:
    {context_str}
    
    Official's Question: {question}
    
    Answer clearly and concisely:
    """
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=45.0
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("response", "").strip()
            return "Failed to get response from AI."
    except Exception as e:
        print(f"RAG Llama 3 Error: {e}")
        return "AI Assistant is currently unavailable."
