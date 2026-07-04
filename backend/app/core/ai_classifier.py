import httpx
import json
import logging
from typing import Dict, Any, Optional, Tuple
from app.models.grievance import Department, Priority

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"

# SBERT Model loading (lazy load to speed up startup)
_sbert_model = None

def get_sbert_embeddings(text: str) -> Optional[list]:
    """Generates 384-dimensional vector embeddings using pre-trained SBERT for duplicate checking."""
    global _sbert_model
    try:
        if _sbert_model is None:
            from sentence_transformers import SentenceTransformer
            _sbert_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        embeddings = _sbert_model.encode(text)
        return embeddings.tolist()
    except Exception as e:
        logger.error(f"SBERT Embedding generation failed: {e}")
        return None

async def classify_grievance_text(text: str) -> Dict[str, Any]:
    """
    Uses Llama 3 via local Ollama to classify text (Hindi/English) into department, subcategory, 
    priority and check if it is emergency.
    """
    prompt = f"""
    You are an AI officer for JanMitra, the national grievance portal of India.
    Analyze the following grievance text (which could be in Hindi, English, or Odia) and classify it.
    
    You must return ONLY a JSON object with these exact keys:
    - department: One of ["water_supply", "electricity", "roads", "drainage", "sanitation", "environment", "public_safety", "government_services", "disaster", "healthcare", "education", "transport", "other"]
    - sub_category: Specify a keyword for the problem (e.g. "potholes", "no_water_supply", "power_outage")
    - priority: One of ["low", "medium", "high", "critical"]
    - is_emergency: boolean (true if there is immediate physical danger to life or infrastructure, e.g. fires, floods, hanging live wires)
    - summary: A 1-sentence summary of the problem in English.
    
    Grievance Text: {text}
    
    JSON Output:
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
                timeout=15.0
            )
            if response.status_code == 200:
                result_json = response.json().get("response", "{}")
                data = json.loads(result_json)
                return {
                    "department": data.get("department", "other"),
                    "sub_category": data.get("sub_category", "other"),
                    "priority": data.get("priority", "medium"),
                    "is_emergency": data.get("is_emergency", False),
                    "summary": data.get("summary", "Civic issue submitted by citizen")
                }
    except Exception as e:
        logger.error(f"Llama 3 classification failed: {e}")
        
    # Fallback to rule-based classification if Ollama is not running/fails
    return fallback_rule_based_classifier(text)

def fallback_rule_based_classifier(text: str) -> Dict[str, Any]:
    """Simple keyword matching fallback for English/Hindi/Odia."""
    text_lower = text.lower()
    
    # Department matching
    department = "other"
    sub_category = "other"
    priority = "medium"
    is_emergency = False
    
    if any(k in text_lower for k in ["पानी", "जल", "water", "pipe", "leak", "taps", "supply"]):
        department = "water_supply"
        sub_category = "no_water_supply"
        if "leak" in text_lower or "burst" in text_lower:
            sub_category = "water_leakage"
    elif any(k in text_lower for k in ["बिजली", "तार", "electricity", "power", "wire", "light", "transformer"]):
        department = "electricity"
        sub_category = "power_outage"
        if "wire" in text_lower or "pole" in text_lower:
            sub_category = "hanging_live_wire"
            is_emergency = True
            priority = "critical"
    elif any(k in text_lower for k in ["गड्ढा", "गड्ढे", "road", "pothole", "divider", "path"]):
        department = "roads"
        sub_category = "potholes"
    elif any(k in text_lower for k in ["कचरा", "कूड़ा", "garbage", "waste", "dustbin", "clean"]):
        department = "sanitation"
        sub_category = "garbage_not_collected"
    elif any(k in text_lower for k in ["नाला", "नाला बह", "drain", "sewer", "overflow", "manhole"]):
        department = "drainage"
        sub_category = "drain_overflow"
        if "manhole" in text_lower:
            sub_category = "open_manhole"
            is_emergency = True
            priority = "critical"

    return {
        "department": department,
        "sub_category": sub_category,
        "priority": priority,
        "is_emergency": is_emergency,
        "summary": text[:60] + "..." if len(text) > 60 else text
    }

def run_image_yolo_inference(image_path: str) -> Tuple[Optional[str], float]:
    """Runs YOLOv8 model inference using an ensemble of pothole and garbage models."""
    try:
        from ultralytics import YOLO
        import os
        
        best_pred = None
        best_conf = 0.0
        
        # 1. Check Custom Pothole Model
        pothole_model_path = "A:/constitution/ai_models/runs/detect/civic_issues_v1/weights/best.pt"
        if os.path.exists(pothole_model_path):
            try:
                model = YOLO(pothole_model_path)
                results = model(image_path)
                for r in results:
                    if len(r.boxes) > 0:
                        top_box = r.boxes[0]
                        conf = float(top_box.conf[0])
                        cls = int(top_box.cls[0])
                        name = r.names[cls]
                        if "pothole" in name.lower() and conf > best_conf:
                            best_pred = "pothole"
                            best_conf = conf
            except Exception as ex:
                logger.warning(f"Pothole YOLO inference failed: {ex}")
                
        # 2. Check Garbage/Waste Detection Model
        garbage_model_path = "A:/constitution/ai_models/datasets/temp_garbage/best_model.pt"
        if os.path.exists(garbage_model_path):
            try:
                model = YOLO(garbage_model_path)
                results = model(image_path)
                for r in results:
                    if len(r.boxes) > 0:
                        top_box = r.boxes[0]
                        conf = float(top_box.conf[0])
                        cls = int(top_box.cls[0])
                        name = r.names[cls].lower()
                        # Map any waste sub-category to "garbage"
                        if name in ["glass", "metal", "paper", "plastic", "waste"] and conf > best_conf:
                            best_pred = "garbage"
                            best_conf = conf
            except Exception as ex:
                logger.warning(f"Garbage YOLO inference failed: {ex}")
                
        # 3. Fallback to standard yolov8n
        if not best_pred:
            yolo_n_path = "A:/constitution/ai_models/yolov8n.pt"
            if os.path.exists(yolo_n_path):
                try:
                    model = YOLO(yolo_n_path)
                    results = model(image_path)
                    for r in results:
                        if len(r.boxes) > 0:
                            top_box = r.boxes[0]
                            conf = float(top_box.conf[0])
                            cls = int(top_box.cls[0])
                            name = r.names[cls]
                            if conf > best_conf:
                                best_pred = name
                                best_conf = conf
                except Exception as ex:
                    logger.warning(f"YOLOv8n inference failed: {ex}")
                    
        return best_pred, best_conf
    except Exception as e:
        logger.warning(f"YOLOv8 ensemble inference failed: {e}")
        return None, 0.0

