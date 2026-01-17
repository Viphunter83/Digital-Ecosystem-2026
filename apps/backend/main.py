from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Digital Ecosystem 2026 API",
    description="Backend API for RusStankoSbyt PWA Platform",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Digital Ecosystem 2026 API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
