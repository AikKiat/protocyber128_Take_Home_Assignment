from fastapi import HTTPException, status
from utils.generate_file_hash import retrieve_file_hash
from fastapi import UploadFile,HTTPException,status
import httpx
import uuid

from custom_exceptions import ResourceNotFound

from repository.parse_analysis_object_result import parse_analysis_object
from repository.parse_file_object_result import parse_file_object
from repository.file_uploads_record import (
    check_in_upload_records, 
    add_filename_analysis_id_pair, 
    get_analysis_id_for_uuid,
    add_to_uuid_filename_record,
    set_current_file_uuid,
    retrieve_saved_result,
    store_result
    )

from vt_api_mappers.vt_post_upload_file import FileUploadResponsePayload


import os
from dotenv import load_dotenv
load_dotenv()

VT_API_KEY = os.getenv("VT_API_KEY")
BASE_URL = os.getenv("BASE_URL")


headers = {
    "x-apikey": VT_API_KEY
}


async def get_upload_url_for_large_file():
    """
    Get a special upload URL for files larger than 32MB.
    Each upload URL can be used only once.
    
    Returns the upload URL string.
    """
    url = f"{BASE_URL}/files/upload_url"
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return data["data"]  # Returns the upload URL
    except Exception as e:
        raise RuntimeError(f"[VT_SCAN_FILES_SERVICE] Could not get upload URL for large file. Error: {e}")


async def upload_large_file_to_vt(file: UploadFile, content: bytes, upload_url: str, password: str = None):
    """
    Upload a large file (>32MB) to VirusTotal using a special upload URL.
    
    - **file**: File object containing metadata
    - **content**: File content bytes
    - **upload_url**: Special upload URL obtained from get_upload_url_for_large_file()
    - **password**: Optional password for protected ZIP files
    
    Returns the analysis ID.
    """
    files = {"file": (file.filename, content, file.content_type)}
    data = {}
    if password:
        data["password"] = password
    
    try:
        async with httpx.AsyncClient(timeout=180) as client:  # Longer timeout for large files
            response = await client.post(upload_url, headers=headers, files=files, data=data)
            
            if response.status_code == 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="[VT_SCAN_FILE_SERVICE] Invalid file or password. Check if ZIP password is correct."
                )
            
            response.raise_for_status()
            payload = response.json()
            print(payload)
            content_model = FileUploadResponsePayload.model_validate(payload)
            return content_model.data.id
            
    except HTTPException:
        raise
    except Exception as e:
        raise RuntimeError(f"[VT_SCAN_FILES_SERVICE] Could not upload large file to VT. Error: {e}")


async def upload_file_to_vt_db(file : UploadFile, password : str):

    """
    Upload and analyze a file using VirusTotal API.
    
    - **file**: File to scan (max 32MB)
    - **password**: Optional password for protected ZIP files
    
    Returns the analysis ID. Use GET /analyses/{id} to check status.
    """

    filename = file.filename+"|full"
    file_uuid = str(uuid.uuid3(namespace=uuid.NAMESPACE_OID, name=filename))

    set_current_file_uuid(file_uuid=file_uuid) #set the current filename
    
    if check_in_upload_records(file_uuid = file_uuid):
        analysis_json = retrieve_saved_result(file_uuid=file_uuid)
        if not analysis_json:
            raise ResourceNotFound(f"json of result full analysis object for file_uuid of {file_uuid} not in Redis cache.")
        analysis_object = parse_analysis_object(analysis_json)
        if analysis_object:
            return {"filename" : filename.split("|")[0], "uuid" : file_uuid, "found" : True,  "result": analysis_object}
    
    print("[VT_SCAN_FILES_SERVICE] Cache was a miss. Sending to VT for full scan.")
    
    content = await file.read()
    content_size = len(content)
    
    # Check if file is too large (650MB limit as per VT documentation)
    if content_size > 650 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="[VT_SCAN_FILES_SERVICE] File size exceeds 650MB limit."
        )
    
    # For files larger than 32MB, use special upload URL
    if content_size > 32 * 1024 * 1024:
        print(f"[VT_SCAN_FILES_SERVICE] File size ({content_size / (1024*1024):.2f}MB) exceeds 32MB. Using special upload URL.")
        try:
            upload_url = await get_upload_url_for_large_file()
            analysis_id = await upload_large_file_to_vt(file, content, upload_url, password)
            
            add_to_uuid_filename_record(filename=filename, file_uuid=file_uuid)
            add_filename_analysis_id_pair(file_uuid=file_uuid, analysis_id=analysis_id)
            
            return {"filename": filename.split("|")[0], "uuid": file_uuid, "found": False, "result": analysis_id}
        
        except HTTPException:
            raise
        except Exception as e:
            raise RuntimeError(f"[VT_SCAN_FILES_SERVICE] Could not submit large file to VT for full analysis. Error: {e}")
    
    # For files 32MB or smaller, use standard upload endpoint
    files = {"file": (file.filename, content, file.content_type)}
    data = {}
    if password:
        data["password"] = password
    
    url = f"{BASE_URL}/files"
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(url, headers=headers, files=files, data=data)

            if response.status_code == 409:
                # File already exists in the VT database and an error will be thrown by the VT API. So we need to fetch by hash instead.
                return await get_quick_file_report_from_hash(file)
            
            if response.status_code == 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="[VT_SCAN_FILE_SERVICE] Invalid file or password. Check if ZIP password is correct."
                )
    
        add_to_uuid_filename_record(filename=filename, file_uuid= file_uuid) #add to upload record, since it is a new file hitherto unseen.

    
        response.raise_for_status()
        payload = response.json()
        print(payload)
        content = FileUploadResponsePayload.model_validate(payload)
        analysis_id = content.data.id
        filename = file.filename    

        add_filename_analysis_id_pair(file_uuid=file_uuid, analysis_id=analysis_id)

        return {"filename" : filename.split("|")[0], "uuid" : file_uuid, "found": False, "result": analysis_id}
    
    except HTTPException:
        raise

    except Exception as e:
        raise RuntimeError(f"[VT_SCAN_FILES_SERVICE] Could not submit file to VT for full analysis. Error : {e}")


async def get_analysis_for_file_uuid(file_uuid : str):
    """
    Get the status and results of a file analysis.
    
    - **analysis_id**: The analysis identifier returned from file upload
    
    Returns detailed analysis results including scan status and AV engine verdicts.
    """

    analysis_id = get_analysis_id_for_uuid(file_uuid=file_uuid)
    set_current_file_uuid(file_uuid=file_uuid) #set the current filename
    #No need to check if in upload record, since this service is to get the analysis result already. So filename should be registered.

    url = f"{BASE_URL}/analyses/{analysis_id}"

    try:
    
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(url, headers=headers)
        
        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis {analysis_id} not found"
            )
        
        response.raise_for_status()

        analysis_object = parse_analysis_object(response_json=response.json()["data"])
        store_result(file_uuid=file_uuid, result=analysis_object) #we store into cache, and send over to frontend at the same time.

        return analysis_object
    

    except Exception as e:
        raise RuntimeError(f"[VT_SCAN_FILES_SERVICE] Failed at runtime to get analysis for this file of file_uuid: {file_uuid}. Error : {e}")


async def get_quick_file_report_from_hash(file : UploadFile):
    """
    Get a detailed file report by hash (SHA-256, SHA-1, or MD5).
    
    - **file_hash**: SHA-256, SHA-1, or MD5 hash of the file
    
    Returns comprehensive file information including reputation, tags, and threat analysis.
    """

    filename = file.filename+"|quick"

    file_uuid = str(uuid.uuid3(namespace=uuid.NAMESPACE_OID, name=filename))
    print("uuid:", file_uuid)
    set_current_file_uuid(file_uuid=file_uuid) #set the current filename

    if check_in_upload_records(file_uuid = file_uuid):
        hash_json = retrieve_saved_result(file_uuid=file_uuid)
        if not hash_json:
            raise ResourceNotFound(f"json of result file object for file_uuid of {file_uuid} not in Redis cache.")
        
        hash_object = parse_file_object(response_json=hash_json)
        if hash_object:
            return {"filename" : filename.split("|")[0], "uuid": file_uuid, "found" : True, "result" : hash_object}
        
    print("[VT_SCAN_SERVICE] Cache was a miss. Sending file hash to VT to do a scan.")

    file_hash = retrieve_file_hash(file=file)
    print(file_hash)

    url = f"{BASE_URL}/files/{file_hash}"

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(url, headers=headers)
    
        if response.status_code == 404:
            raise ResourceNotFound("[VT_SCAN_SERVICE] File not found in VirusTotal database.")
    
        response.raise_for_status()

        file_object = parse_file_object(response_json=response.json()["data"])
        store_result(file_uuid=file_uuid, result=file_object) #store into cache, and send result to frontend as well

        add_to_uuid_filename_record(filename=filename, file_uuid= file_uuid) #add to upload record, since it is a new file hitherto unseen.

        return {"filename" : filename.split("|")[0], "uuid": file_uuid, "found" : False, "result" : file_object}

    except ResourceNotFound:
        raise

    except Exception as e:
        print("error", e)
        raise RuntimeError(f"[VT_SCAN_SERVICE] Could not get a quick hash lookup for file of file_uuid = {file_uuid} due to: {e}")


