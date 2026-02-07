from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.vt_scan_files import router as vt_router
from routes.ai_summarise import router as ai_router
from routes.files_operations import router as fileops_router


app = FastAPI(
    title="ProtoCyber VirusTotal Scanner",
    description="API for scanning files using VirusTotal",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(vt_router)
app.include_router(ai_router)
app.include_router(fileops_router)

@app.get("/", tags=["Health"])
async def root():
    return {"status": "online", "service": "ProtoCyber VirusTotal Scanner"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}