from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.llm import generate_civic_entities
import httpx

router = APIRouter(prefix="/assistant", tags=["Assistant"])

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"

@router.post("/chat")
async def chat_with_civic_data(query: str, db: Session = Depends(get_db)):
    """
    RAG Assistant: Answers questions based on the database complaints and gis data.
    """
    # Simple RAG implementation: fetch recent complaints context
    # In a real scenario, this would use semantic search (SBERT embeddings)
    # on the complaints to get relevant context.
    
    # Mocking context retrieval for now to provide the structure
    context = "There are 24 active water complaints in Ward 12."
    
    prompt = f"""
    You are JanMitra AI, a municipal dashboard assistant.
    Answer the user's question using the provided context.
    
    Context: {context}
    
    Question: {query}
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
                timeout=60.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {"reply": data.get("response")}
            raise HTTPException(status_code=500, detail="LLM generation failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
