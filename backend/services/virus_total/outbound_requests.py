

from fastapi import UploadFile,HTTPException,status
from utils.config import BASE_URL, VT_API_KEY
import httpx

from parse_responses import parse_analysis, parse_file


headers = {
    "x-apikey": VT_API_KEY
}


async def upload_file_to_virus_total(file : UploadFile, password : str):


    """
    Upload and analyze a file using VirusTotal API.
    
    - **file**: File to scan (max 32MB)
    - **password**: Optional password for protected ZIP files
    
    Returns the analysis ID. Use GET /analyses/{id} to check status.
    """

    content = await file.read()
    
    # Check file size (32MB limit for this endpoint)
    if len(content) > 32 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 32MB. Use /files/upload_url endpoint for larger files."
        )
    
    # Prepare multipart form data
    files = {"file": (file.filename, content, file.content_type)}
    data = {}
    if password:
        data["password"] = password
    
    url = f"{BASE_URL}/files"
    
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, headers=headers, files=files, data=data)
    
    if response.status_code == 400:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file or password. Check if ZIP password is correct."
        )
    
    response.raise_for_status()
    return parse_analysis(response.json())



async def get_analysis_for_upload_id(analysis_id : str):
    """
    Get the status and results of a file analysis.
    
    - **analysis_id**: The analysis identifier returned from file upload
    
    Returns detailed analysis results including scan status and AV engine verdicts.
    """

    url = f"{BASE_URL}/analyses/{analysis_id}"
    
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=headers)
    
    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis {analysis_id} not found"
        )
    
    response.raise_for_status()
    return parse_analysis(response.json())


async def get_file_report_from_hash_id(file_hash : str):
    """
    Get a detailed file report by hash (SHA-256, SHA-1, or MD5).
    
    - **file_hash**: SHA-256, SHA-1, or MD5 hash of the file
    
    Returns comprehensive file information including reputation, tags, and threat analysis.
    """
    url = f"{BASE_URL}/files/{file_hash}"
    
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=headers)
    
    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with hash {file_hash} not found in VirusTotal database"
        )
    
    response.raise_for_status()
    return parse_file(response.json())

