import os
from typing import Optional
import whisper

_whisper_model = None

def transcribe_audio_local(file_path: str) -> Optional[str]:
    """
    Transcribes Hindi/English audio locally using the Whisper Python API.
    """
    global _whisper_model
    try:
        if _whisper_model is None:
            # Lazy load the model on first call
            # Using 'base' model for speed and low RAM footprint
            _whisper_model = whisper.load_model("base")
            
        result = _whisper_model.transcribe(file_path)
        return result.get("text", "").strip()
    except Exception as e:
        print(f"Whisper Transcription Error: {e}")
        return None

