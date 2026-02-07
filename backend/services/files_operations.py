
from repository.file_uploads_record import (
    get_filename_for_uuid, 
    retrieve_full_results, 
    retrieve_hash_results, 
    set_current_upload_result, 
    get_current_upload_result,
    set_current_filename,
    get_current_filename)

from repository.file_uploads_record import FileResponsePayload
from repository.parse_file_object_result import parse_file_object
from repository.parse_analysis_object_result import parse_analysis_object

from custom_exceptions import ResourceNotFound
from constants import Types


def get_results_for_file_uuid(file_uuid : str):
    filename = get_filename_for_uuid(file_uuid=file_uuid)
    set_current_filename(filename=filename)
    

    #INCOMPLETE --> MUST CHECK IF WE ARE CURRENTLY HASH-BASED UPLOAD, OR FULL ANALYSIS UPLOAD.
    
    saved_full_analysis_json = retrieve_full_results(file_uuid=file_uuid)
    saved_full_analysis_object = parse_analysis_object(response_json=saved_full_analysis_json)
    saved_hash_based_analysis_json = retrieve_hash_results(file_uuid=file_uuid)
    saved_hash_based_analysis_object = parse_file_object(response_json=saved_hash_based_analysis_json)

    if saved_full_analysis_object:
        set_current_upload_result(saved_full_analysis_object)
        return {"type" : "full_analysis", "result" : get_current_upload_result()}

    elif saved_hash_based_analysis_object:
        set_current_upload_result(saved_hash_based_analysis_object)
        return {"type" : "hash-based_analysis", "result" : get_current_upload_result()}

    else:
        raise ResourceNotFound("Both saved results, full analysis and hash-based, are missing!")
    


def get_results_type(type : Types):
    if type == Types.FULL_UPLOAD.value:
        full_analysis = retrieve_full_results(filename=get_current_filename())
        return full_analysis    
    else:
        hash_based_analysis = retrieve_hash_results(filename=get_current_filename())
        return hash_based_analysis