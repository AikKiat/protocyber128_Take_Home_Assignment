

from domain.file_uploads_record import FileUploadsRecord
from vt_api_mappers.vt_get_analysis import AnalysisResponsePayload
from vt_api_mappers.vt_get_file_report import FileResponsePayload
from custom_exceptions import ResourceNotFound

def check_in_upload_records(file_uuid : str):
    if file_uuid in FileUploadsRecord.get_instance().uuid_filename_mappings:
        return True
    return False

def retrieve_full_results(file_uuid : str):
    result = FileUploadsRecord.get_instance().get_analysis_object(file_uuid=file_uuid)
    if result is None:
        #means nothing from cache. A possible case is that the file was not sent for full upload.
        print(f"[FILE OPERATIONS REPOSITORY] Domain Results for full analysis for file_uuid: {file_uuid} is None. Was the file uploaded for a full scan?")
    return result


def retrieve_hash_results(file_uuid : str):
    result = FileUploadsRecord.get_instance().get_file_object(file_uuid=file_uuid)
    if result is None:
        print(f"[FILE OPERATIONS REPOSITORY] Domain Results for hash-based analysis for file_uuid: {file_uuid} is None. Was the file uploaded for a hash-based scan?")
    return result


def add_filename_analysis_id_pair(file_uuid : str, analysis_id : str):
    FileUploadsRecord.get_instance().add_to_files_pending_analysis(file_uuid=file_uuid, analysis_id=analysis_id)

def get_analysis_id_for_uuid(file_uuid : str):
    return FileUploadsRecord.get_instance().get_analysis_id_for_file_uuid(file_uuid = file_uuid)



def store_result_from_file_hash(file_uuid, result : FileResponsePayload):
    FileUploadsRecord.get_instance().store_file_hash_result(file_uuid=file_uuid, result_from_hash=result.model_dump_json())

def store_result_from_full_analysis(file_uuid, result : AnalysisResponsePayload):
    FileUploadsRecord.get_instance().store_analysis_result(file_uuid=file_uuid, analysis_result=result.model_dump_json())



def get_current_upload_result():
    return FileUploadsRecord.get_instance().vt_upload_result

def set_current_upload_result(upload_result : FileResponsePayload | AnalysisResponsePayload):
    FileUploadsRecord.get_instance().vt_upload_result = upload_result




def get_filename_for_uuid(file_uuid : str):
    return FileUploadsRecord.get_instance().get_filename_for_uuid(file_uuid=file_uuid)

def add_to_uuid_filename_record(filename : str, file_uuid : str):
    FileUploadsRecord.get_instance().add_to_uuid_filename_record(filename=filename, file_uuid = file_uuid)


def get_current_file_uuid():
    current_file_uuid = FileUploadsRecord.get_instance().current_uuid
    if current_file_uuid == "":
        raise ValueError("[FILES UPLOAD RECORD REPOSITORY] current file UUID is empty. Check again.")
    if current_file_uuid is None:
        raise ResourceNotFound("[FILES UPLOAD RECORD] Current file uuid cannot be found. Check again.")
    
    return current_file_uuid

def set_current_file_uuid(file_uuid : str):
    FileUploadsRecord.get_instance().current_uuid = file_uuid

