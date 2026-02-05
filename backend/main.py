from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.virus_total.virus_total_scan import router as vt_router

app = FastAPI(
    title="ProtoCyber VirusTotal Scanner",
    description="API for scanning files using VirusTotal",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(vt_router)

@app.get("/", tags=["Health"])
async def root():
    return {"status": "online", "service": "ProtoCyber VirusTotal Scanner"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}