from fastapi import APIRouter, BackgroundTasks
import subprocess
import logging

router = APIRouter()

def run_ingestion_script(script_name: str):
    # This assumes scripts are executable or run via python
    # Path is relative to container WORKDIR /app
    logging.info(f"Triggering {script_name}")
    subprocess.run(["python", f"scripts/ingest/{script_name}.py"])

@router.post("/trigger")
async def trigger_ingestion(background_tasks: BackgroundTasks):
    """
    Trigger the data ingestion process asynchronously.
    """
    background_tasks.add_task(run_ingestion_script, "ingest_excel")
    background_tasks.add_task(run_ingestion_script, "ingest_pdf")
    return {"status": "Ingestion started", "details": "Excel and PDF parsing running in background"}
