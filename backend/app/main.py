import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, grievances, assistant, gis, dashboard
from app.core.scheduler import start_escalation_scheduler

app = FastAPI(title="JanMitra AI API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for tunnel support
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_escalation_scheduler())

app.include_router(auth.router)
app.include_router(grievances.router)
app.include_router(assistant.router)
app.include_router(gis.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to JanMitra AI Production API"}


