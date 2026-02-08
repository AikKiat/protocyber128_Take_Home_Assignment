
from repository.file_uploads_record import (
    get_current_file_uuid,
    retrieve_full_results, 
    retrieve_hash_results, 
    set_current_file_uuid)


from repository.parse_file_object_result import parse_file_object
from repository.parse_analysis_object_result import parse_analysis_object

from custom_exceptions import ResourceNotFound
from constants import Types
from utils.config import SystemSettings

from vt_api_mappers.vt_get_file_report import FileResponsePayload
from vt_api_mappers.vt_get_analysis import AnalysisResponsePayload


def get_results_for_file_uuid(file_uuid : str):

    set_current_file_uuid(file_uuid=file_uuid)

    saved_full_analysis_object : AnalysisResponsePayload = None
    saved_hash_based_analysis_object : FileResponsePayload = None
    
    saved_full_analysis_object = fetch_full_scan_result_object(file_uuid=file_uuid)
    saved_hash_based_analysis_object = fetch_hash_based_result_object(file_uuid=file_uuid)

        
    if not saved_hash_based_analysis_object and not saved_full_analysis_object:
        raise ResourceNotFound("Both hash-based file object and full scan analysis objects are None.")
    
    return {Types.FULL_UPLOAD.value : saved_full_analysis_object, Types.HASH_BASED.value : saved_hash_based_analysis_object}




#HELPER FUNCTIONS
def fetch_full_scan_result_object(file_uuid):
    saved_full_analysis_json = retrieve_full_results(file_uuid=file_uuid)
    if saved_full_analysis_json is not None:
        return parse_analysis_object(response_json=saved_full_analysis_json)
    print(f"[FILE OPERATIONS SERVICE] The json value from the cache for a full analysis result is None for file_uuid of {file_uuid}. Check if the file was uploaded for full scan.")
    return None


def fetch_hash_based_result_object(file_uuid):
    saved_hash_based_json = retrieve_hash_results(file_uuid=file_uuid)
    if saved_hash_based_json is not None:
        return parse_file_object(response_json=saved_hash_based_json)
    print(f"[FILE OPERATIONS SERVICE] The json value from the cache for a hash based result is None for file_uuid of {file_uuid}. Check if the file was uploaded for full scan.")
    return None
    




def toggle_modes(type : str, need_fetch : bool):
    scan_result : FileResponsePayload | AnalysisResponsePayload = None
    if need_fetch:
        current_file_uuid = get_current_file_uuid()

        match(type):
            case Types.FULL_UPLOAD.value:
                scan_result = fetch_full_scan_result_object(file_uuid=current_file_uuid)
            case Types.HASH_BASED.value:
                scan_result = fetch_hash_based_result_object(file_uuid=current_file_uuid)
            case _:
                raise ValueError("[FILE OPERATIONS SERVICE] Invalid upload mode provided to determine which scan data needs to be fetched.")
    
    SystemSettings.get_instance().current_focused_mode = type

    
    return {"toggled_mode" : type, "saved_result" : scan_result}