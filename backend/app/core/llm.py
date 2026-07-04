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
