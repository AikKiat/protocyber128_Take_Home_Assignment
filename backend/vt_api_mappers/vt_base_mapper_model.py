from pydantic import BaseModel


class VTBaseModel(BaseModel):
    class Config:
        extra = "allow" 
