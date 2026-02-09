

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing_extensions import Dict

from services.files_operations import get_results_for_file_uuid, toggle_modes

router = APIRouter(prefix="/files")


class SelectFileRequest(BaseModel):
    uuid : str

@router.post("/select")
async def select_file(request : SelectFileRequest):
    file_uuid = request.uuid
    saved_result : Dict = get_results_for_file_uuid(file_uuid=file_uuid)

    
    if not saved_result:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, details="Failed to get analysis results")

    return {"status" : status.HTTP_200_OK, "result" : saved_result}
    
