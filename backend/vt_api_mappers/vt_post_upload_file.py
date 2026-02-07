

from pydantic import BaseModel
from typing_extensions import Optional, Dict

class FileUploadResponsePayload(BaseModel):
    data : Data

class Data(BaseModel):
    type : str
    id : str
    links : Dict[str, str]