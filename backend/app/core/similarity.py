import logging
import imagehash
from PIL import Image
from typing import List, Tuple
import os

logger = logging.getLogger(__name__)

def check_text_duplicate(embedding1: List[float], embedding2: List[float], threshold: float = 0.85) -> bool:
    """
    Uses cosine similarity between SBERT embeddings to detect duplicates.
    """
    if not embedding1 or not embedding2:
        return False
        
    try:
        import numpy as np
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Calculate cosine similarity
        sim = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        return float(sim) >= threshold
    except Exception as e:
        logger.error(f"SBERT similarity check failed: {e}")
        return False

def check_image_duplicate(img_path1: str, img_path2: str, threshold: int = 5) -> bool:
    """
    Uses Perceptual Hashing (pHash) to detect identical or near-identical images.
    Threshold is the Hamming distance (lower means more similar, 0 is identical).
    """
    if not os.path.exists(img_path1) or not os.path.exists(img_path2):
        return False
        
    try:
        hash1 = imagehash.phash(Image.open(img_path1))
        hash2 = imagehash.phash(Image.open(img_path2))
        
        # Calculate hamming distance
        distance = hash1 - hash2
        return distance <= threshold
    except Exception as e:
        logger.error(f"pHash image similarity check failed: {e}")
        return False
