from fastapi import APIRouter, UploadFile, File, status, HTTPException
from utils.config import SystemSettings
from typing import Optional
from custom_exceptions import ResourceNotFound
from services.vt_scan_files import upload_file_to_vt_db, get_quick_file_report_from_hash, get_analysis_for_file_uuid


router = APIRouter(prefix="/vt", tags=["VirusTotal"])

FILE_UPLOAD_MAX_SIZE = SystemSettings.get_instance().max_size

@router.post("/upload-complete") #WORKS
async def full_scan(file: UploadFile = File(...), password: Optional[str] = None):
    
    # VirusTotal supports files up to 650MB
    VT_MAX_FILE_SIZE = 650 * 1024 * 1024  # 650MB
    
    if file.size > VT_MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 650MB limit. VirusTotal does not support files larger than this."
        )

    try:
        result = await upload_file_to_vt_db(file=file, password=password)

        """
        returns: {"filename" : filename, "uuid" : _uuid, "Found" : True,  "analysis_object": analysis_object}
        or:
        returns : {"filename" : filename, "uuid" : _uuid, "Found": False, "analysis_id": analysis_id}
        """
            
        return {"status" : status.HTTP_200_OK, "result" : result}
        """
        returns:
        {
            "status" : 200
            "results": {
                    analysis_id: "....",
                    filename: "..."
                } 
        }  
        """
            
    except Exception as e:
        raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error, failed to reach endpoint , {e}"
        ) 


    
@router.post("/upload-quick")  #WORKS
async def quick_lookup_hash(file : UploadFile):

    if file.size > FILE_UPLOAD_MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size is too big."
        )

    try:
        result = await get_quick_file_report_from_hash(file=file)

        return {"status" : status.HTTP_200_OK, "result" : result}
    
        """
            returns: 
            {
                "status" : 200
                "result": File Object from VirusTotal API
            }
        """

    except ResourceNotFound as e:
        return {
            "status": status.HTTP_204_NO_CONTENT, 
            "result": None,
            "message": str(e)
        }

    except Exception as e:
        raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error, failed to reach endpoint, {e}"
            ) 
    





@router.get("/current-analysis/{file_uuid}") #WORKS
async def get_analysis( file_uuid : str):
    try:
        result = await get_analysis_for_file_uuid(file_uuid = file_uuid)
        return {"status" : status.HTTP_200_OK, "result" : result}
    
        """
        returns: 
        {
            "status" : 200
            "result": Analysis Object from VirusTotal API
        }
        """
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reach backend endpoint due to : {e}"
        )
    
