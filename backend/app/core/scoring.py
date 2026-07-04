def calculate_priority_score(complaint_data: dict) -> float:
    """
    Multi-Criteria Decision Making (MCDM) algorithm for Civic Priority.
    Weights:
    - Sentinel Category (e.g. Health/Water > Roads > Garbage) = 30%
    - Duplicate Count / Clustering Density = 25%
    - LLM Severity (High=1, Medium=0.5, Low=0.1) = 25%
    - Population Buffer Gap (distance to nearest facility) = 20%
    """
    score = 0.0
    
    # 1. Category Base Weight
    cat_weights = {
        "Water": 1.0,
        "Health": 1.0,
        "Electricity": 0.8,
        "Roads": 0.7,
        "Sanitation": 0.6,
        "Garbage": 0.5
    }
    category = complaint_data.get("category", "Other")
    base_weight = cat_weights.get(category, 0.3)
    score += base_weight * 30.0
    
    # 2. Duplicate Density
    duplicates = complaint_data.get("duplicates_count", 0)
    # Cap at 10 duplicates for max score
    density_factor = min(duplicates / 10.0, 1.0)
    score += density_factor * 25.0
    
    # 3. LLM Severity 
    severity_map = {"High": 1.0, "Medium": 0.5, "Low": 0.1}
    severity = complaint_data.get("priority", "Medium")
    severity_factor = severity_map.get(severity, 0.5)
    score += severity_factor * 25.0
    
    # 4. Population Buffer Gap (mock implementation - replace with PostGIS query)
    # If distance to facility is large, impact is higher
    distance_to_service = complaint_data.get("distance_km", 5.0) 
    distance_factor = min(distance_to_service / 10.0, 1.0)
    score += distance_factor * 20.0
    
    return round(score, 2)
