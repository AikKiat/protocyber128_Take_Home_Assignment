
from repository.file_uploads_record import (
    get_filename_for_uuid, 
    retrieve_full_results, 
    retrieve_hash_results, 
    set_current_upload_result, 
    get_current_upload_result,
    set_current_filename,
    get_current_filename)

from custom_exceptions import ResourceNotFound
from constants import Types


async def get_results_for_file_uuid(uuid : str):
    filename = get_filename_for_uuid(uuid)

    set_current_filename(filename=filename)
    

    saved_full_analysis = await retrieve_full_results(filename=filename)
    saved_hash_based_analysis = await retrieve_hash_results(filename=filename)

    if saved_full_analysis:
        set_current_upload_result(saved_full_analysis)
        return {"type" : "full_analysis", "result" : get_current_upload_result()}

    elif saved_hash_based_analysis:
        set_current_upload_result(saved_hash_based_analysis)
        return {"type" : "hash-based_analysis", "result" : get_current_upload_result()}

    else:
        raise ResourceNotFound("Both saved results, full analysis and hash-based, are missing!")
    


async def get_results_type(type : Types):
    if type == Types.FULL_UPLOAD.value:
        full_analysis = await retrieve_full_results(filename=get_current_filename())