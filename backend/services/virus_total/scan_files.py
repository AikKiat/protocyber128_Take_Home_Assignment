



from fastapi import HTTPException, status
from utils.generate_file_hash import hash_sha256
from utils.config import FILE_UPLOAD_POLICY
import tempfile, os, shutil


from services.virus_total.outbound_requests import get_file_report_from_hash_id, upload_file_to_virus_total


async def scan_file_with_policy(file, password=None):
    try:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temporary_path = tmp.name

        
        file_hash = hash_sha256(temporary_path)

        try:
            report = await get_file_report_from_hash_id(file_hash=file_hash)
            
            return {
                "status" : "KNOWN",
                "hash" : file_hash,
                "report" : report
            }
        
        except HTTPException as exception:
            if exception.status_code != 404:
                raise #means it is something else other than resource not found. If it is resource not found then we will upload the file to VT. 
            #Otherwise this is an unprecedented error that must be caught.

        #Over here, we have not returned yet nor raised exception. So, means the file hash was not found and no unprecedented HTTP error occured.
        #So, we will upload file to VT.

        if FILE_UPLOAD_POLICY == "BLOCK":
            return {
                "status" : "NO_UPLOADS_ALLOWED",
                "message" : "Due to File Upload Policy, cannot upload file"
            }
        
        file.file.seek(0)

        analysis_id = await upload_file_to_virus_total(file=file, password=password)
        return {
            "status" : "UPLOADED",
            "hash" : file_hash,
            "analysis" : analysis_id
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to scan file due to error : {e}"
        )

    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.unlink(temporary_path)