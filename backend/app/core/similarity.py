from sentence_transformers import SentenceTransformer
import numpy as np

class SimilarityEngine:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initializes the local SBERT model for complaint duplicate detection.
        Using a small, fast model to run completely locally without API keys.
        Produces 384-dimensional embeddings (matching our pgvector setup).
        """
        try:
            self.model = SentenceTransformer(model_name)
        except Exception as e:
            print(f"Warning: Could not load SentenceTransformer {model_name}. Error: {e}")
            self.model = None

    def get_embedding(self, text: str) -> list[float]:
        """
        Converts a text string (complaint description + title) into a vector.
        """
        if not self.model:
            # Fallback random vector if model failed to load (for testing)
            return np.random.rand(384).tolist()
            
        embedding = self.model.encode(text)
        return embedding.tolist()
        
similarity_engine = SimilarityEngine()
