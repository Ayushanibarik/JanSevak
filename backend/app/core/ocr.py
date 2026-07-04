import os
import logging
from PIL import Image
import pytesseract
from typing import Optional

logger = logging.getLogger(__name__)

def perform_ocr(image_path: str, lang: str = 'eng+hin') -> Optional[str]:
    """
    Uses Tesseract OCR to extract text from handwriting or printed fonts
    in citizen submission images.
    """
    try:
        if not os.path.exists(image_path):
            logger.error(f"OCR failed: Image not found at {image_path}")
            return None
        
        img = Image.open(image_path)
        # Using Hindi + English by default, which are common for Indian portals
        text = pytesseract.image_to_string(img, lang=lang)
        return text.strip()
    except Exception as e:
        logger.error(f"OCR Error: {e}")
        return None
