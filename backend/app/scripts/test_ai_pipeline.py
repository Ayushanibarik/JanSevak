import asyncio
import os

async def test_all_modules():
    print("Testing AI Modules with a real image and text...")
    
    from app.core.ocr import perform_ocr
    from app.core.translation import detect_language, translate_to_english
    from app.core.ai_classifier import classify_grievance_text
    from app.core.ner_sentiment import get_ner_entities, get_sentiment
    from app.core.similarity import check_text_duplicate, check_image_duplicate
    from app.core.spam_detection import is_spam, cross_check_gps_with_text
    from app.core.vision import analyze_civic_image
    from app.core.llm import ask_rag_assistant
    
    image_path = r"C:\Users\AYUSH\.gemini\antigravity-ide\brain\8f47e13a-90d1-499b-966b-27a12b5b9aa9\test_pothole_image_1783135867105.png"
    text = "There is a massive pothole in front of the SBI Bank in Delhi causing major accidents."
    
    print("\n--- 1. Vision (YOLOv8) ---")
    vision_res = analyze_civic_image(image_path)
    print(vision_res)
    
    print("\n--- 2. Spam Check ---")
    spam = is_spam(text)
    print(f"Is Spam: {spam}")
    
    print("\n--- 3. Language & Translation ---")
    lang = detect_language(text)
    eng_text = translate_to_english(text, lang)
    print(f"Lang: {lang} | Eng: {eng_text}")
    
    print("\n--- 4. Topic Classification (DistilBERT) ---")
    classification = await classify_grievance_text(eng_text)
    print(classification)
    
    print("\n--- 5. NER & Sentiment ---")
    entities = get_ner_entities(eng_text)
    sentiment = get_sentiment(eng_text)
    print(f"Entities: {entities}")
    print(f"Sentiment: {sentiment}")
    
    print("\n--- Test Completed Successfully ---")
    
if __name__ == "__main__":
    asyncio.run(test_all_modules())
