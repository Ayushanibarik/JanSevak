from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from typing import Optional

router = APIRouter(prefix="/gis", tags=["GIS"])

@router.get("/heatmap")
def get_complaint_heatmap(
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns a GeoJSON of grievance locations to render a density heatmap on the frontend.
    """
    conditions = ["geom IS NOT NULL"]
    params = {}
    
    if department and department != "all":
        conditions.append("department::text = :department")
        params["department"] = department.upper()
    if status and status != "all":
        conditions.append("status::text = :status")
        params["status"] = status.upper()
    if priority and priority != "all":
        conditions.append("priority::text = :priority")
        params["priority"] = priority.upper()
    if ward:
        conditions.append("ward_number = :ward")
        params["ward"] = ward
    if start_date:
        conditions.append("created_at >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("created_at <= :end_date")
        params["end_date"] = end_date
        
    where_clause = " AND ".join(conditions)
    
    query = text(f"""
        SELECT 
            id, 
            grievance_token,
            title, 
            priority, 
            department,
            sub_category,
            status,
            ST_AsGeoJSON(geom)::json AS geometry
        FROM grievances 
        WHERE {where_clause}
    """)
    
    result = db.execute(query, params).fetchall()
    
    features = []
    for row in result:
        features.append({
            "type": "Feature",
            "properties": {
                "id": row.grievance_token,
                "title": row.title,
                "priority": row.priority.value if hasattr(row.priority, 'value') else str(row.priority),
                "department": row.department.value if hasattr(row.department, 'value') else str(row.department),
                "sub_category": row.sub_category,
                "status": row.status.value if hasattr(row.status, 'value') else str(row.status)
            },
            "geometry": row.geometry
        })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/buffer-analysis")
def get_service_buffer(lat: float, lon: float, radius_km: float = 5.0, db: Session = Depends(get_db)):
    """
    Finds all grievances within a specified radius (in kilometers) from a central point.
    Uses PostGIS ST_DWithin and geography casting for accurate distance calculation.
    """
    query = text("""
        SELECT 
            id, 
            title, 
            priority,
            department,
            sub_category,
            ST_Distance(
                geom::geography, 
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
            ) / 1000 AS distance_km
        FROM grievances
        WHERE ST_DWithin(
            geom::geography, 
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 
            :radius_meters
        )
        ORDER BY distance_km ASC
    """)
    
    result = db.execute(query, {"lat": lat, "lon": lon, "radius_meters": radius_km * 1000}).fetchall()
    
    return [
        {
            "id": str(row.id),
            "title": row.title,
            "department": row.department,
            "sub_category": row.sub_category,
            "priority": row.priority,
            "distance_km": round(row.distance_km, 2)
        } for row in result
    ]
