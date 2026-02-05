from fastapi import APIRouter, UploadFile, File, status, HTTPException
from typing import Optional


from entities.file_upload_analysis import AnalysisResponse
from entities.file_report import FileResponse


from services.virus_total.policy_decision_point import scan_file_with_policy
from services.virus_total.outbound_requests import get_analysis_for_upload_id

router = APIRouter(prefix="vt", tags=["VirusTotal"])


analysis_ids = [] #store somewhere.

@router.post("/upload", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def upload_file(file: UploadFile = File(...), password: Optional[str] = None):
    
    try:
        result = await scan_file_with_policy(file=file, password=password)
        
        match result["status"] :
            case "KNOWN":
                return result["report"]
        
            case "UNKNOWN":
                analysis_ids.append(result["analysis_id"])

            case "NO_UPLOADS_ALLOWED":
                raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["message"]
            )
            
            case _:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Unhandled scan state"
                )
            
    except Exception as e:
        raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error, failed to reach endpoint"
            ) 



@router.get("/current-analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis( analysis_id: str):
    try:
        result = await get_analysis_for_upload_id(analysis_id)
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reach backend endpoint due to : {e}"
        )
    
