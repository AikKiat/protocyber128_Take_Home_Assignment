

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from services.files_operations import get_results_for_file_uuid

router = APIRouter(prefix="/files")


class SelectFileRequest(BaseModel):
    uuid : str

@router.post("/select")
async def select_file(request : SelectFileRequest):
    file_uuid = request.uuid
    analysis_result = await get_results_for_file_uuid(uuid=file_uuid)

    if not analysis_result:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, details="Analysis result is null")
