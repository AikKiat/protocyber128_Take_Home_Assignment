

from pydantic import BaseModel
from typing_extensions import Optional, Dict


class Data(BaseModel):
    type : str
    id : str
    links : Dict[str, str]

class FileUploadResponsePayload(BaseModel):
    data : Data
