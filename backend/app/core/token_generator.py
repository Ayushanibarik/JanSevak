"""
Grievance Token Generator
Format: GR-{YEAR}-{DISTRICT}-{DEPT_CODE}-{SEQUENCE}
Example: GR-2026-BBSR-WS-004512

- GR = Grievance
- 2026 = Year of submission
- BBSR = District code (Bhubaneswar, Delhi=DEL, Lucknow=LKO, etc.)
- WS = Department code (Water Supply)
- 004512 = Auto-incrementing sequence per district per year
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.grievance import Grievance, Department, DEPT_CODES


def generate_grievance_token(
    db: Session,
    department: Department,
    district_code: str = "BBSR",
) -> str:
    """Generate a unique grievance token in government format."""
    year = datetime.now().year
    dept_code = DEPT_CODES.get(department, "OT")

    # Count existing grievances for this district + year to get sequence
    count = db.query(func.count(Grievance.id)).filter(
        Grievance.district_code == district_code,
        func.extract("year", Grievance.created_at) == year,
    ).scalar() or 0

    sequence = count + 1
    token = f"GR-{year}-{district_code}-{dept_code}-{sequence:06d}"

    # Ensure uniqueness (in case of race condition)
    while db.query(Grievance).filter(Grievance.grievance_token == token).first():
        sequence += 1
        token = f"GR-{year}-{district_code}-{dept_code}-{sequence:06d}"

    return token


# ─── District Code Registry ─────────────────────────────────────────
DISTRICT_CODES = {
    # Odisha
    "bhubaneswar": "BBSR",
    "cuttack": "CTC",
    "puri": "PUR",
    "berhampur": "BHM",
    "sambalpur": "SBP",
    "rourkela": "RKL",
    # Major metros
    "delhi": "DEL",
    "mumbai": "MUM",
    "kolkata": "KOL",
    "chennai": "CHN",
    "bangalore": "BLR",
    "hyderabad": "HYD",
    "ahmedabad": "AMD",
    "pune": "PUN",
    "jaipur": "JAI",
    "lucknow": "LKO",
    "kanpur": "KNP",
    "patna": "PAT",
    "indore": "IND",
    "bhopal": "BPL",
    "chandigarh": "CHG",
    "guwahati": "GHY",
    "ranchi": "RNC",
    "dehradun": "DDN",
    "shimla": "SML",
    "thiruvananthapuram": "TVM",
    "kochi": "KOC",
    "visakhapatnam": "VZG",
    "nagpur": "NGP",
    "coimbatore": "CBE",
    "surat": "SRT",
    "vadodara": "VDR",
}
