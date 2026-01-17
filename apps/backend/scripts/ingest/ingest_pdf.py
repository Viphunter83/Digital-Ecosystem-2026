import os
import logging
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from packages.database.models import Document
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

# OpenAI Client Setup
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.proxyapi.ru/openai/v1")
)
EMBEDDING_MODEL = os.getenv("OPENAI_MODEL_EMBEDDING", "text-embedding-3-small")

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def get_embedding(text: str):
    """
    Generate embedding using OpenAI API (via ProxyAPI).
    """
    text = text.replace("\n", " ")
    response = client.embeddings.create(input=[text], model=EMBEDDING_MODEL)
    return response.data[0].embedding

def extract_text_from_pdf(filepath):
    try:
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error reading PDF {filepath}: {e}")
        return ""

def extract_text_from_docx(filepath):
    try:
        doc = DocxDocument(filepath)
        return "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        logger.error(f"Error reading DOCX {filepath}: {e}")
        return ""

def ingest_docs(session: Session):
    for root, dirs, files in os.walk(INPUT_DIR):
        for file in files:
            filepath = os.path.join(root, file)
            content = ""
            source_type = "unknown"
            
            if file.lower().endswith('.pdf'):
                logger.info(f"Processing PDF: {file}")
                content = extract_text_from_pdf(filepath)
                source_type = "pdf_doc"
            elif file.lower().endswith('.docx'):
                logger.info(f"Processing DOCX: {file}")
                content = extract_text_from_docx(filepath)
                source_type = "docx_doc"
            
            if content.strip():
                # Chunking strategy (simple)
                chunk_size = 1000
                chunks = [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
                
                for i, chunk in enumerate(chunks):
                    doc = Document(
                        id=uuid4(),
                        title=f"{file} - Part {i+1}",
                        content=chunk,
                        source_type=source_type,
                        metadata_={"original_file": file, "chunk_index": i},
                        embedding=get_embedding(chunk)
                    )

                    session.add(doc)
                
                session.commit()
                logger.info(f"Saved {len(chunks)} chunks for {file}")

if __name__ == "__main__":
    session = get_db_session()
    ingest_docs(session)
    session.close()
