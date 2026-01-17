import os
import glob
import pandas as pd
import logging
from docx import Document
from geopy.geocoders import Nominatim
from decimal import Decimal
import re
import json

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
INPUT_DIR = "../../../_input_materials"  # Relative to apps/backend/scripts
GEO_USER_AGENT = "russtankosbyt_importer_v1"

def clean_price(price_str):
    if pd.isna(price_str):
        return None
    # Remove spaces and non-numeric chars except comma/dot
    clean = re.sub(r'[^\d.,]', '', str(price_str))
    clean = clean.replace(',', '.')
    try:
        return Decimal(clean)
    except:
        return None

def get_coordinates(location_name, geolocator):
    try:
        location = geolocator.geocode(location_name)
        if location:
            return location.latitude, location.longitude
    except Exception as e:
        logger.warning(f"Geocoding failed for {location_name}: {e}")
    return None, None

def ingest_references(file_path):
    logger.info(f"Processing Reference File: {file_path}")
    try:
        df = pd.read_excel(file_path)
        # Normalize headers if needed, assuming standard format per user request
        # Expected columns: "Заказчик", "Виды работ", "Предпочтительный регион" (or similar)
        
        geolocator = Nominatim(user_agent=GEO_USER_AGENT)
        
        for index, row in df.iterrows():
            try:
                client_name = row.get('Заказчик')
                work_type = row.get('Виды работ')
                region = row.get('Предпочтительный регион')
                
                if pd.isna(client_name) or pd.isna(work_type):
                    logger.warning(f"Skipping row {index}: Missing Client or Work Type")
                    continue

                # Mock DB Insertion (Replace with actual ORM calls)
                logger.info(f"Found Client: {client_name}")
                
                # Geocoding
                lat, lon = None, None
                if region:
                    lat, lon = get_coordinates(region, geolocator)
                elif "г." in str(client_name): # Extract city from client name if possible
                     # Simple heuristic or regex could go here
                     pass
                
                project_data = {
                    "title": work_type,
                    "client": client_name,
                    "region": region,
                    "latitude": lat,
                    "longitude": lon
                }
                logger.info(f"Prepared Project Data: {project_data}")
                
            except Exception as e:
                logger.error(f"Error processing row {index} in {file_path}: {e}")

    except Exception as e:
        logger.error(f"Failed to read Excel file {file_path}: {e}")

def ingest_tech_specs(file_path):
    logger.info(f"Processing Tech Spec File: {file_path}")
    try:
        doc = Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        
        text_content = "\n".join(full_text)
        
        # Simple extraction logic based on "Наименование работ" and "Состав работ"
        # This is a heuristic approach
        name_match = re.search(r'Наименование работ[:\s]+(.*?)(?=\n|$)', text_content, re.IGNORECASE)
        composition_match = re.search(r'Состав работ[:\s]+(.*?)(?=\n|$)', text_content, re.IGNORECASE | re.DOTALL)
        
        machine_data = {
            "source_file": os.path.basename(file_path),
            "extracted_name": name_match.group(1).strip() if name_match else None,
            "raw_composition": composition_match.group(1).strip()[:500] if composition_match else None # Truncate for preview
        }
        
        logger.info(f"Extracted Machine Data: {json.dumps(machine_data, ensure_ascii=False, indent=2)}")

    except Exception as e:
        logger.error(f"Failed to process Docx file {file_path}: {e}")

def main():
    logger.info("Starting Data Ingestion...")
    
    # 1. Process Reference Excel Files
    excel_files = glob.glob(os.path.join(INPUT_DIR, "Справка_референс_*.xlsx"))
    for file in excel_files:
        ingest_references(file)
        
    # 2. Process Tech Spec Docx Files
    docx_files = glob.glob(os.path.join(INPUT_DIR, "ТП *.docx"))
    for file in docx_files:
        ingest_tech_specs(file)
        
    # 3. Process Catalog (If CSV exists) - Placeholder
    csv_files = glob.glob(os.path.join(INPUT_DIR, "*.csv"))
    for file in csv_files:
        logger.info(f"Found CSV (Catalog Candidate): {file}")
        # Implement CSV logic here

    logger.info("Ingestion Complete.")

if __name__ == "__main__":
    main()
