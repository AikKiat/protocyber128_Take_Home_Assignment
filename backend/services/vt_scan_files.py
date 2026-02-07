from fastapi import HTTPException, status
from utils.generate_file_hash import retrieve_file_hash
from fastapi import UploadFile,HTTPException,status
import httpx
import uuid

from repository.parse_analysis_object_result import parse_analysis_object
from repository.parse_file_object_result import parse_file_object
from repository.file_uploads_record import (
    check_in_upload_records, 
    retrieve_full_results, 
    retrieve_hash_results, 
    add_filename_analysis_id_pair, 
    get_analysis_id_for_filename,
    store_result_from_file_hash,
    store_result_from_full_analysis,
    add_to_uuid_filename_record,
    set_current_filename
    )

from vt_api_mappers.vt_post_upload_file import FileUploadResponsePayload


import os
from dotenv import load_dotenv
load_dotenv()

VT_API_KEY = os.getenv("VT_API_KEY")
BASE_URL = os.getenv("BASE_URL")

####Main Service Methods
headers = {
    "x-apikey": VT_API_KEY
}


async def upload_file_to_vt_db(file : UploadFile, password : str):

    """
    Upload and analyze a file using VirusTotal API.
    
    - **file**: File to scan (max 32MB)
    - **password**: Optional password for protected ZIP files
    
    Returns the analysis ID. Use GET /analyses/{id} to check status.
    """

    filename = file.filename
    _uuid = uuid.uuid3(namespace=uuid.NAMESPACE_OID, name=filename)

    set_current_filename(filename=filename) #set the current filename
    
    if check_in_upload_records(_uuid = _uuid):
        analysis_object = await retrieve_full_results(filename=filename)
        if analysis_object:
            analysis_object = parse_analysis_object(response_json=response.json())
            return {"filename" : filename, "Found" : True,  "analysis_object": analysis_object}
    
    print("Cache was a miss. Sending to VT for full scan.")

    add_to_uuid_filename_record(filename=filename, _uuid= _uuid) #add to upload record, since it is a new file hitherto unseen.
    
    content = await file.read()
    
    if len(content) > 32 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 32MB. Use /files/upload_url endpoint for larger files."
        )
    
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
    payload = response.json()
    print(payload)
    content = FileUploadResponsePayload.model_validate(payload)
    analysis_id = content.data.id
    filename = file.filename    

    add_filename_analysis_id_pair(filename=filename, analysis_id=analysis_id)

    return {"filename" : filename, "uuid" : _uuid, "Found": False, "analysis_id": analysis_id}


async def get_analysis_for_filename(filename : str):
    """
    Get the status and results of a file analysis.
    
    - **analysis_id**: The analysis identifier returned from file upload
    
    Returns detailed analysis results including scan status and AV engine verdicts.
    """

    set_current_filename(filename=filename) #set the current filename
    analysis_id = get_analysis_id_for_filename(filename=filename)
    #No need to check if in upload record, since this service is to get the analysis result already. So filename should be registered.

    

    url = f"{BASE_URL}/analyses/{analysis_id}"
    
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=headers)
    
    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis {analysis_id} not found"
        )
    
    response.raise_for_status()

    analysis_object = parse_analysis_object(response_json=response.json())
    store_result_from_full_analysis(filename=filename, result=analysis_object) #we store into cache, and send over to frontend at the same time.

    return analysis_object


async def get_quick_file_report_from_hash(file : UploadFile):
    """
    Get a detailed file report by hash (SHA-256, SHA-1, or MD5).
    
    - **file_hash**: SHA-256, SHA-1, or MD5 hash of the file
    
    Returns comprehensive file information including reputation, tags, and threat analysis.
    """

    filename = file.filename
    set_current_filename(filename=filename) #set the current filename

    _uuid = uuid.uuid3(namespace=uuid.NAMESPACE_OID, name=filename)

    if check_in_upload_records(_uuid = _uuid):
        hash_object = await retrieve_hash_results(filename=filename)
        if hash_object:
            file_object = parse_file_object(response_json=response.json())
            return {"filename" : filename, "uuid": _uuid, "found" : True, "result" : file_object}
        
    print("Cache was a miss. Sending file hash to VT to do a scan.")

    file_hash = retrieve_file_hash(file=file)

    url = f"{BASE_URL}/files/{file_hash}"
    
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=headers)
    
    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with hash {file_hash} not found in VirusTotal database"
        )
    
    response.raise_for_status()

    file_object = parse_file_object(response_json=response.json())
    store_result_from_file_hash(filename=filename, result=file_object) #store into cache, and send result to frontend as well

    return file_object

