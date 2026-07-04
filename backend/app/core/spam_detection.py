import logging
from geopy.distance import geodesic
from typing import Tuple

logger = logging.getLogger(__name__)

def is_spam(text: str) -> bool:
    """
    Binary classifier heuristic for gibberish or spam detection.
    Real implementation would use a trained model or regex-based metrics.
    """
    # Simple heuristic: If text has extremely long words without spaces or repeating chars
    if len(text) < 5:
        return True
    
    # Check for gibberish (e.g. "asdfasdfasdf")
    words = text.split()
    if any(len(w) > 30 for w in words): 
        return True
        
    return False

def cross_check_gps_with_text(submitted_lat_lon: Tuple[float, float], extracted_locations: list) -> bool:
    """
    Cross-checks the submitted GPS location against locations mentioned in text.
    Returns True if valid, False if it appears fake (distance > 50km).
    """
    if not extracted_locations:
        return True # Can't cross check
        
    try:
        from geopy.geocoders import Nominatim
        geolocator = Nominatim(user_agent="janmitra_agent")
        
        # Check the first location found
        loc_name = extracted_locations[0]
        location = geolocator.geocode(loc_name)
        
        if location:
            text_coords = (location.latitude, location.longitude)
            distance_km = geodesic(submitted_lat_lon, text_coords).kilometers
            
            # If distance is suspiciously far
            if distance_km > 50:
                logger.warning(f"GPS mismatch: User submitted {submitted_lat_lon}, but text says {loc_name} ({distance_km}km away)")
                return False
        return True
    except Exception as e:
        logger.error(f"GPS cross-check failed: {e}")
        return True
