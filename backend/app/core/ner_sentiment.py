import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

_spacy_model = None
_sentiment_pipeline = None

def get_ner_entities(text: str) -> Dict[str, List[str]]:
    """
    Extracts Named Entities (LOC, GPE, FAC, PERSON) using spaCy to help geolocate the complaint.
    """
    global _spacy_model
    try:
        if _spacy_model is None:
            import spacy
            # en_core_web_sm should be installed via: python -m spacy download en_core_web_sm
            _spacy_model = spacy.load("en_core_web_sm")
            
        doc = _spacy_model(text)
        entities = {
            "locations": [ent.text for ent in doc.ents if ent.label_ in ['LOC', 'GPE', 'FAC']],
            "persons": [ent.text for ent in doc.ents if ent.label_ == 'PERSON'],
            "orgs": [ent.text for ent in doc.ents if ent.label_ == 'ORG'],
            "dates": [ent.text for ent in doc.ents if ent.label_ == 'DATE']
        }
        return entities
    except Exception as e:
        logger.error(f"NER extraction failed: {e}")
        return {"locations": [], "persons": [], "orgs": [], "dates": []}

def get_sentiment(text: str) -> Dict[str, float]:
    """
    Uses a multilingual RoBERTa model to detect sentiment. 
    Returns scores for panic/anger/urgency.
    """
    global _sentiment_pipeline
    try:
        if _sentiment_pipeline is None:
            from transformers import pipeline
            _sentiment_pipeline = pipeline(
                "sentiment-analysis", 
                model="cardiffnlp/twitter-xlm-roberta-base-sentiment",
                return_all_scores=True
            )
            
        # Model returns Negative, Neutral, Positive
        results = _sentiment_pipeline(text[:512], top_k=None)
        if isinstance(results, list) and isinstance(results[0], list):
            results = results[0]
        elif isinstance(results, dict):
            results = [results]
            
        scores = {res['label'].lower(): res['score'] for res in results}
        
        # High anger/panic can be mapped to 'negative' for RoBERTa
        is_urgent = scores.get('negative', 0.0) > 0.8
        
        return {
            "negative": scores.get('negative', 0.0),
            "neutral": scores.get('neutral', 0.0),
            "positive": scores.get('positive', 0.0),
            "is_urgent": is_urgent
        }
    except Exception as e:
        logger.error(f"Sentiment analysis failed: {e}")
        return {"negative": 0.0, "neutral": 1.0, "positive": 0.0, "is_urgent": False}
