"""
Development server startup script
"""
import os
import sys
from pathlib import Path


def check_env_file():
    """Check if .env file exists"""
    if not Path(".env").exists():
        print("⚠️  .env file not found!")
        print("   Creating from .env.example...")
        
        if Path(".env.example").exists():
            import shutil
            shutil.copy(".env.example", ".env")
            print("   ✅ .env file created")
            print("   ⚠️  Please edit .env and add your VT_API_KEY")
            sys.exit(1)
        else:
            print("   ❌ .env.example not found")
            sys.exit(1)
    
    # Check if VT_API_KEY is set
    from dotenv import load_dotenv
    load_dotenv()
    
    vt_key = os.getenv("VT_API_KEY", "")
    if not vt_key or vt_key == "your_virustotal_api_key_here":
        print("⚠️  VT_API_KEY not configured in .env file")
        print("   Please add your VirusTotal API key")
        sys.exit(1)
    
    print("✅ Environment configured")


def check_dependencies():
    """Check if required packages are installed"""
    try:
        import fastapi
        import httpx
        import pydantic
        import uvicorn
        print("✅ Dependencies installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e.name}")
        print("   Run: pip install -r requirements.txt")
        sys.exit(1)


def start_server():
    """Start the FastAPI server"""
    import uvicorn
    
    print("\n" + "=" * 60)
    print("Starting ProtoCyber VirusTotal Scanner")
    print("=" * 60)
    print("\n📝 API Documentation:")
    print("   Swagger UI: http://localhost:8000/docs")
    print("   ReDoc:      http://localhost:8000/redoc")
    print("\n🔍 Health Check:")
    print("   http://localhost:8000/health")
    print("\n" + "=" * 60 + "\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


if __name__ == "__main__":
    print("\n🚀 Starting development server...\n")
    
    check_dependencies()
    check_env_file()
    start_server()
