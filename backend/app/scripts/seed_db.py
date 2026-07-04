import sys
import os
import random
from datetime import datetime, timedelta

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.session import SessionLocal
from app.models.user import User, RoleEnum, ROLE_HIERARCHY
from app.models.grievance import Grievance, Department, GrievanceStatus, Priority
from app.models.grievance_timeline import GrievanceTimeline
from app.models.escalation_log import EscalationLog
from app.core.token_generator import generate_grievance_token
from app.api.auth import get_password_hash

# Bhubaneswar Bounding Box Coordinates
LAT_MIN, LAT_MAX = 20.25, 20.35
LON_MIN, LON_MAX = 85.75, 85.88

DEMO_DEPARTMENTS = [
    Department.WATER_SUPPLY,
    Department.ELECTRICITY,
    Department.ROADS,
    Department.DRAINAGE,
    Department.SANITATION,
    Department.ENVIRONMENT,
    Department.PUBLIC_SAFETY,
    Department.GOVERNMENT_SERVICES,
    Department.DISASTER,
    Department.HEALTHCARE,
    Department.EDUCATION,
    Department.TRANSPORT,
    Department.OTHER
]

# Hindi/Odia/English multilingual seed scenarios
SCENARIOS = [
    {
        "dept": Department.WATER_SUPPLY,
        "sub": "dirty_drinking_water",
        "title": "गंदा पानी आपूर्ति | Contaminated Water Supply",
        "desc": "पिछले 3 दिनों से नल में गंदा और बदबूदार पानी आ रहा है। बच्चे बीमार पड़ रहे हैं। Sewage water seems mixed in drinking pipeline. Please fix.",
        "prio": Priority.HIGH
    },
    {
        "dept": Department.WATER_SUPPLY,
        "sub": "pipeline_burst",
        "title": "ପାଇପ୍ ଲିକ୍ ହେତୁ ଜଳ ନଷ୍ଟ | Water Pipeline Leakage",
        "desc": "Bhubaneswar Ward 12 Main road side re pipe burst heichi. Water leakage causing huge waste and road logging. ପାଣି ବହି ଯାଉଛି ଶୀଘ୍ର ବନ୍ଦ କରନ୍ତୁ।",
        "prio": Priority.HIGH
    },
    {
        "dept": Department.ELECTRICITY,
        "sub": "hanging_live_wire",
        "title": "ଲଟକି ରହିଥିବା ବିଦ୍ୟୁତ ତାର | Hanging Live Wires",
        "desc": "Heavy wind drop electricity wires near park gate. Danger of electrocution for kids playing around. ବିଦ୍ୟୁତ୍ ତାର ଝୁଲୁଛି, ଅଘଟଣ ଘଟିପାରେ।",
        "prio": Priority.CRITICAL,
        "emergency": True
    },
    {
        "dept": Department.ELECTRICITY,
        "sub": "power_outage",
        "title": "बार-बार बिजली कटौती | Regular Power Outage",
        "desc": "Power cuts for 6-8 hours daily without schedule in summer. Students preparing for exams are suffering.",
        "prio": Priority.MEDIUM
    },
    {
        "dept": Department.ROADS,
        "sub": "potholes",
        "title": "ରାସ୍ତାରେ ବଡ ଗାଡିଆ | Deep Potholes on Main Road",
        "desc": "Very deep potholes on VIP road towards Airport. Dangerous for two wheelers at night. ଗାଡ଼ି ଚଳାଇବା ସୁରକ୍ଷିତ ନୁହେଁ।",
        "prio": Priority.MEDIUM
    },
    {
        "dept": Department.ROADS,
        "sub": "road_blockage",
        "title": "सड़क पर निर्माण मलबा | Construction Debris on Road",
        "desc": "Large heap of sand and bricks dumped on corner street blocking traffic. Causes accidents.",
        "prio": Priority.LOW
    },
    {
        "dept": Department.SANITATION,
        "sub": "garbage_not_collected",
        "title": "कचरा ढेर की सफाई न होना | Uncollected Garbage Accumulation",
        "desc": "Solid waste and plastic garbage piled up on road side near market area. Stinks terribly and stray animals spreading it.",
        "prio": Priority.MEDIUM
    },
    {
        "dept": Department.SANITATION,
        "sub": "waste_burning",
        "title": "କଚଡା ଜଳାଇବା | Open Burning of Plastic Waste",
        "desc": "Sweepers burning plastic and dry leaves every morning. Severe smoke causing breathing trouble for elder citizens.",
        "prio": Priority.MEDIUM
    },
    {
        "dept": Department.DRAINAGE,
        "sub": "drain_overflow",
        "title": "ଉଛୁଳୁଥିବା ନାଳ | Overflowing Sewer Drain",
        "desc": "Blocked drainage channel causing toxic black water to overflow onto houses. ମଇଳା ପାଣି ରାସ୍ତାରେ ଭାସୁଛି।",
        "prio": Priority.HIGH
    },
    {
        "dept": Department.DRAINAGE,
        "sub": "open_manhole",
        "title": "खुला मैनहोल | Open Manhole Danger",
        "desc": "Missing manhole cover on footpath near bus stop. Accident waiting to happen in rainy season. Highly dangerous.",
        "prio": Priority.CRITICAL,
        "emergency": True
    },
    {
        "dept": Department.ENVIRONMENT,
        "sub": "fallen_tree",
        "title": "ଗଛ ପଡି ରାସ୍ତା ବନ୍ଦ | Fallen Tree Blocking Street",
        "desc": "Big banyan tree fell down during storm, blocking inner lane of Ward 4 completely.",
        "prio": Priority.MEDIUM
    },
    {
        "dept": Department.PUBLIC_SAFETY,
        "sub": "broken_traffic_signal",
        "title": "ट्रैफिक सिग्नल बंद | Non-functional Traffic Signal",
        "desc": "Traffic lights at busy square are broken for 2 days. Heavy congestion and traffic jam.",
        "prio": Priority.MEDIUM
    },
    {
        "dept": Department.GOVERNMENT_SERVICES,
        "sub": "ration_issue",
        "title": "ରାସନ କାର୍ଡ ସମସ୍ୟା | PDS Ration Card Issue",
        "desc": "Ration dealer denying rice quota under central scheme. Poor villagers returned empty handed.",
        "prio": Priority.LOW
    },
    {
        "dept": Department.DISASTER,
        "sub": "flood",
        "title": "बाढ़ जैसी जलभराव की स्थिति | Flash Flood Waterlogging",
        "desc": "Continuous rain has filled low-lying colonies with 3 feet water. People trapped inside houses. Need rescue/pumps.",
        "prio": Priority.CRITICAL,
        "emergency": True
    },
    {
        "dept": Department.HEALTHCARE,
        "sub": "hospital_sanitation",
        "title": "PHC Center Dirtiness | PHC Sanitation",
        "desc": "Bhubaneswar primary health clinic in unhygienic state. Blood stains on beds, medical waste dumped in open.",
        "prio": Priority.HIGH
    },
    {
        "dept": Department.EDUCATION,
        "sub": "mid_day_meal",
        "title": "ମଧ୍ୟାହ୍ନ ଭୋଜନ ସମସ୍ୟା | Mid-day Meal Quality Complaint",
        "desc": "School serves stale and low quality food to kids. Quality check needed urgently.",
        "prio": Priority.MEDIUM
    },
    {
        "dept": Department.TRANSPORT,
        "sub": "bus_stop_damage",
        "title": "बस स्टैंड शेड क्षति | Broken Bus Stop Shed",
        "desc": "Bus stop tin roof blown away by wind, passengers waiting in heat/rain without protection.",
        "prio": Priority.LOW
    }
]

def generate_random_coords():
    lat = random.uniform(LAT_MIN, LAT_MAX)
    lon = random.uniform(LON_MIN, LON_MAX)
    return lat, lon

def seed_database():
    db = SessionLocal()
    print("Deleting old entries from Database...")
    db.query(GrievanceTimeline).delete()
    db.query(EscalationLog).delete()
    db.query(Grievance).delete()
    db.query(User).delete()
    db.commit()

    print("Creating Demo Officer Accounts...")
    hashed_pass = get_password_hash("password123")
    
    # 1. Citizen
    citizen = User(
        full_name="Ramesh Kumar (Citizen)",
        email="citizen.demo@example.com",
        phone_number="9999999999",
        hashed_password=hashed_pass,
        role=RoleEnum.CITIZEN,
        hierarchy_level=0,
        district_code="BBSR"
    )
    db.add(citizen)
    db.commit()
    db.refresh(citizen)

    # 2. Hierarchy Officers (representing level 1 to 8)
    officers = []
    
    # Department specific Junior, Assistant, and Executive Engineers
    dept_officers = {}
    
    # Populate major departments with JE, AE, EE
    major_depts = [Department.WATER_SUPPLY, Department.ELECTRICITY, Department.ROADS, Department.DRAINAGE, Department.SANITATION]
    
    for dept in major_depts:
        dept_name = dept.value
        # JE (Level 2)
        je = User(
            full_name=f"Rajesh Patra (JE - {dept_name.replace('_', ' ').title()})",
            email=f"je.{dept_name}@gov.in",
            phone_number=f"9777{random.randint(100000, 999999)}",
            hashed_password=hashed_pass,
            role=RoleEnum.JUNIOR_ENGINEER,
            hierarchy_level=2,
            department=dept_name,
            district_code="BBSR"
        )
        # AE (Level 3)
        ae = User(
            full_name=f"Suresh Mohanty (AE - {dept_name.replace('_', ' ').title()})",
            email=f"ae.{dept_name}@gov.in",
            phone_number=f"9666{random.randint(100000, 999999)}",
            hashed_password=hashed_pass,
            role=RoleEnum.ASSISTANT_ENGINEER,
            hierarchy_level=3,
            department=dept_name,
            district_code="BBSR"
        )
        # EE (Level 4)
        ee = User(
            full_name=f"Amit Verma (EE - {dept_name.replace('_', ' ').title()})",
            email=f"ee.{dept_name}@gov.in",
            phone_number=f"9555{random.randint(100000, 999999)}",
            hashed_password=hashed_pass,
            role=RoleEnum.EXECUTIVE_ENGINEER,
            hierarchy_level=4,
            department=dept_name,
            district_code="BBSR"
        )
        db.add_all([je, ae, ee])
        db.commit()
        db.refresh(je)
        db.refresh(ae)
        db.refresh(ee)
        dept_officers[dept] = {2: je, 3: ae, 4: ee}

    # Ward Officer (Level 1)
    ward_officer = User(
        full_name="Binod Sahu (Ward Officer)",
        email="ward.officer@gov.in",
        phone_number="9888888888",
        hashed_password=hashed_pass,
        role=RoleEnum.WARD_OFFICER,
        hierarchy_level=1,
        ward_number="12",
        district_code="BBSR"
    )
    # Municipal Commissioner (Level 5)
    commissioner = User(
        full_name="Dr. Arindam Das (Municipal Commissioner)",
        email="commissioner.bbsr@gov.in",
        phone_number="9444444444",
        hashed_password=hashed_pass,
        role=RoleEnum.MUNICIPAL_COMMISSIONER,
        hierarchy_level=5,
        district_code="BBSR"
    )
    # District Collector (Level 6)
    collector = User(
        full_name="Sanjay Singh, IAS (District Collector)",
        email="collector.khordha@gov.in",
        phone_number="9333333333",
        hashed_password=hashed_pass,
        role=RoleEnum.DISTRICT_COLLECTOR,
        hierarchy_level=6,
        district_code="BBSR"
    )
    # State Secretary (Level 7)
    secretary = User(
        full_name="Priyanka Sen, IAS (State Secretary)",
        email="sec.housing@gov.in",
        phone_number="9222222222",
        hashed_password=hashed_pass,
        role=RoleEnum.STATE_SECRETARY,
        hierarchy_level=7,
        district_code="BBSR"
    )
    # Minister (Level 8)
    minister = User(
        full_name="Shri Pratap Jena (Urban Development Minister)",
        email="minister.urban@gov.in",
        phone_number="9111111111",
        hashed_password=hashed_pass,
        role=RoleEnum.MINISTER,
        hierarchy_level=8,
        district_code="BBSR"
    )
    db.add_all([ward_officer, commissioner, collector, secretary, minister])
    db.commit()
    db.refresh(ward_officer)
    db.refresh(commissioner)
    db.refresh(collector)
    db.refresh(secretary)
    db.refresh(minister)

    print("Seeding 50+ Grievances...")
    # Generate 55 grievances
    mock_vector = [0.05] * 384  # fast mock embedding vector to bypass sentence-transformers
    created_grievances = []
    
    statuses = list(GrievanceStatus)
    
    for i in range(55):
        scenario = random.choice(SCENARIOS)
        lat, lon = generate_random_coords()
        
        # Select status with realistic distribution (more submitted/assigned/in_progress than completed/false)
        status_weights = [
            0.15,  # SUBMITTED
            0.05,  # AI_VERIFIED
            0.20,  # ASSIGNED
            0.10,  # ACCEPTED
            0.05,  # INSPECTION
            0.05,  # WORK_ORDER
            0.15,  # IN_PROGRESS
            0.10,  # COMPLETED
            0.05,  # CITIZEN_VERIFIED
            0.05,  # CLOSED
            0.02,  # REJECTED
            0.01,  # DUPLICATE
            0.01,  # WITHDRAWN
            0.01,  # FALSE_COMPLAINT
            0.05,  # APPEALED
        ]
        status = random.choices(statuses, weights=status_weights)[0]
        
        # Formulate token
        token = generate_grievance_token(db, scenario["dept"], "BBSR")
        
        # Assigned Officer
        assigned_officer_id = None
        current_level = 1
        
        if status in [GrievanceStatus.ASSIGNED, GrievanceStatus.ACCEPTED, GrievanceStatus.IN_PROGRESS, GrievanceStatus.COMPLETED]:
            # Look up officer
            if scenario["dept"] in dept_officers:
                assigned_officer_id = dept_officers[scenario["dept"]][2].id  # Assign to JE
                current_level = 2
            else:
                assigned_officer_id = ward_officer.id
                current_level = 1

        is_emergency = scenario.get("emergency", False)
        
        # Past dates (spread over last 30 days)
        created_at = datetime.utcnow() - timedelta(days=random.randint(1, 30), hours=random.randint(0, 23))
        
        # Deadlines
        deadline_hours = 4 if is_emergency else 48
        escalation_deadline = created_at + timedelta(hours=deadline_hours)

        grievance = Grievance(
            grievance_token=token,
            department=scenario["dept"],
            sub_category=scenario["sub"],
            title=scenario["title"] + f" (Seed #{i+1})",
            description=scenario["desc"],
            status=status,
            priority=scenario["prio"],
            is_emergency=is_emergency,
            latitude=lat,
            longitude=lon,
            address=f"Street {random.randint(1, 25)}, Sector {random.randint(1, 10)}, Ward {random.choice(['4', '12', '18', '24'])}, Bhubaneswar",
            ward_number=random.choice(["4", "12", "18", "24"]),
            district_code="BBSR",
            pincode=f"7510{random.randint(10, 24)}",
            geom=f"SRID=4326;POINT({lon} {lat})",
            is_anonymous=random.choice([True, False, False]),
            reporter_id=citizen.id,
            current_hierarchy_level=current_level,
            escalation_deadline=escalation_deadline,
            embedding=mock_vector,
            ai_department_suggestion=scenario["dept"].value,
            ai_priority_suggestion=scenario["prio"].value,
            ai_summary=scenario["title"],
            ai_confidence=0.92,
            created_at=created_at
        )
        
        # Mock feedback
        if status in [GrievanceStatus.COMPLETED, GrievanceStatus.CITIZEN_VERIFIED, GrievanceStatus.CLOSED]:
            grievance.citizen_feedback_rating = random.choice([1, 2, 4, 5, 5])
            grievance.citizen_feedback_text = "Good job" if grievance.citizen_feedback_rating >= 4 else "Slow response"
            grievance.resolution_notes = "Issue resolved by department team."
            
        db.add(grievance)
        db.flush()
        
        # Timeline
        t1 = GrievanceTimeline(
            grievance_id=grievance.id,
            old_status=None,
            new_status=GrievanceStatus.SUBMITTED.value,
            action_type="status_change",
            notes="Grievance submitted by citizen.",
            changed_at=created_at,
            ip_address="192.168.1.100"
        )
        db.add(t1)
        
        if assigned_officer_id:
            t2 = GrievanceTimeline(
                grievance_id=grievance.id,
                old_status=GrievanceStatus.SUBMITTED.value,
                new_status=GrievanceStatus.ASSIGNED.value,
                action_type="assignment",
                notes=f"Auto-assigned to officer (Level {current_level}) based on department.",
                changed_at=created_at + timedelta(minutes=10),
                changed_by_id=None
            )
            db.add(t2)

        created_grievances.append(grievance)

    db.commit()
    
    # 5. Link duplicate child cases (approx 3 duplicate records)
    print("Setting up duplicate complaints link...")
    for j in range(3):
        child = created_grievances[j]
        parent = created_grievances[20 + j]
        child.status = GrievanceStatus.DUPLICATE
        child.is_duplicate_of = parent.id
        
        t_dup = GrievanceTimeline(
            grievance_id=child.id,
            old_status=child.status.value,
            new_status=GrievanceStatus.DUPLICATE.value,
            action_type="status_change",
            notes=f"Auto-flagged as duplicate of {parent.grievance_token} by SBERT similarity engine.",
            changed_at=child.created_at + timedelta(minutes=5)
        )
        db.add(t_dup)
        
    # 6. Add some mock auto-escalations (for overdue items)
    print("Setting up auto-escalations log...")
    now = datetime.utcnow()
    for k in range(5):
        overdue_grievance = created_grievances[10 + k]
        # set deadline in past and make level higher
        overdue_grievance.escalation_deadline = now - timedelta(hours=2)
        old_level = overdue_grievance.current_hierarchy_level
        new_level = old_level + 1
        
        # log escalation
        esc = EscalationLog(
            grievance_id=overdue_grievance.id,
            from_officer_id=overdue_grievance.assigned_officer_id,
            to_officer_id=commissioner.id,
            from_level=old_level,
            to_level=new_level,
            reason="Deadline expired - auto-escalation trigger.",
            is_auto=True,
            escalated_at=now - timedelta(hours=1)
        )
        db.add(esc)
        
        overdue_grievance.current_hierarchy_level = new_level
        overdue_grievance.assigned_officer_id = commissioner.id
        
        t_esc = GrievanceTimeline(
            grievance_id=overdue_grievance.id,
            old_status=overdue_grievance.status.value,
            new_status=overdue_grievance.status.value,
            action_type="escalation",
            notes=f"System auto-escalated to Level {new_level} (Municipal Commissioner) due to SLA breach.",
            changed_at=now - timedelta(hours=1)
        )
        db.add(t_esc)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
