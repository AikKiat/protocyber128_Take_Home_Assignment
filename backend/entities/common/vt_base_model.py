from pydantic import BaseModel
from typing import Optional, Dict, Any


class VTBaseModel(BaseModel):
    class Config:
        extra = "allow"   # VERY IMPORTANT for VirusTotal
