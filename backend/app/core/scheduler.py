import asyncio
import logging
from app.db.session import SessionLocal
from app.core.escalation import check_and_escalate

logger = logging.getLogger(__name__)

async def start_escalation_scheduler():
    """
    Background loop that runs check_and_escalate every hour.
    """
    logger.info("Initializing JanMitra Escalation Engine Daemon...")
    while True:
        try:
            db = SessionLocal()
            try:
                check_and_escalate(db)
                logger.info("Auto-escalation check completed successfully.")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error in escalation scheduler: {e}")
            
        # Run every 60 minutes
        await asyncio.sleep(3600)
