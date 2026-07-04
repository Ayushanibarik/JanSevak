import logging
from typing import Optional

logger = logging.getLogger(__name__)

_fasttext_model = None
_nllb_pipeline = None

def get_language_detection_model():
    global _fasttext_model
    import fasttext
    # FastText requires downloading lid.176.bin or .ftz, we mock this for local safety unless available
    # In production, download lid.176.bin
    try:
        if _fasttext_model is None:
            import os
            # Assume model is in app/models/ relative to app/core/
            default_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "lid.176.ftz"))
            FT_MODEL_PATH = os.getenv("FASTTEXT_MODEL_PATH", default_path)
            _fasttext_model = fasttext.load_model(FT_MODEL_PATH)
        return _fasttext_model
    except Exception as e:
        logger.error(f"FastText load error (Ensure lid.176.ftz is downloaded): {e}")
        return None

def detect_language(text: str) -> str:
    """Detects language using fastText. Returns language code like 'hi', 'en', etc."""
    model = get_language_detection_model()
    if model:
        predictions = model.predict(text.replace('\n', ' '))
        # fastText returns __label__eng, strip it
        return predictions[0][0].replace('__label__', '')
    # Fallback heuristic
    return 'en'

def translate_to_english(text: str, source_lang: str) -> str:
    """
    Uses NLLB-200 (distilled-600M) to translate incoming text to English.
    """
    if source_lang.startswith('en'):
        return text
        
    global _nllb_pipeline
    try:
        if _nllb_pipeline is None:
            from transformers import pipeline
            _nllb_pipeline = pipeline('translation', model='facebook/nllb-200-distilled-600M')
            
        # NLLB requires BCP-47-like FLORES-200 codes e.g. hin_Deva for Hindi
        # As a simplification in MVP, we just rely on pipeline defaults or mapping
        lang_map = {
            'hi': 'hin_Deva',
            'or': 'ory_Orya',
            'mr': 'mar_Deva'
        }
        src_code = lang_map.get(source_lang, 'hin_Deva') 
        
        result = _nllb_pipeline(text, src_lang=src_code, tgt_lang='eng_Latn')
        return result[0]['translation_text']
    except Exception as e:
        logger.error(f"NLLB translation error: {e}")
        # Fallback to returning original text if translation fails
        return text
