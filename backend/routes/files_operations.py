

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from services.files_operations import get_results_for_file_uuid, toggle_modes

router = APIRouter(prefix="/files")


class SelectFileRequest(BaseModel):
    uuid : str

@router.post("/select")
async def select_file(request : SelectFileRequest):
    file_uuid = request.uuid
    saved_results = get_results_for_file_uuid(file_uuid=file_uuid)

    #Returns : {Types.FULL_UPLOAD.value : saved_full_analysis_object, Types.HASH_BASED.value : saved_hash_based_analysis_object}

    
    if not saved_results:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, details="Failed to get analysis results")

    return saved_results

class ToggleUploadRequest(BaseModel):
    mode : str
    need_fetch : bool

@router.post("/toggle-upload")
async def select_file(request : ToggleUploadRequest):
    result = toggle_modes(request.mode, request.need_fetch)
    print(f"[FILE OPERATIONS ROUTE] Focused Mode Toggled according to frontend: {result["toggled_mode"]}")

    return {"toggled_mode" : result["toggled_mode"], "result" : result["saved_result"]}
    
