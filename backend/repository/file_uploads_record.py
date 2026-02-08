

from domain.file_uploads_record import FileUploadsRecord
from vt_api_mappers.vt_get_analysis import AnalysisResponsePayload
from vt_api_mappers.vt_get_file_report import FileResponsePayload
from custom_exceptions import ResourceNotFound
from typing_extensions import Dict

def check_in_upload_records(file_uuid : str):
    if file_uuid in FileUploadsRecord.get_instance().uuid_filename_mappings:
        return True
    return False


def add_filename_analysis_id_pair(file_uuid : str, analysis_id : str):
    FileUploadsRecord.get_instance().add_to_files_pending_analysis(file_uuid=file_uuid, analysis_id=analysis_id)

def get_analysis_id_for_uuid(file_uuid : str):
    return FileUploadsRecord.get_instance().get_analysis_id_for_file_uuid(file_uuid = file_uuid)



def store_result(file_uuid, result : FileResponsePayload | AnalysisResponsePayload):
    result_json = result.model_dump_json()
    FileUploadsRecord.get_instance().store_result(file_uuid=file_uuid, result_json=result_json)
    FileUploadsRecord.get_instance().vt_upload_result = result_json

def retrieve_saved_result(file_uuid : str):
    result : Dict | None = FileUploadsRecord.get_instance().get_saved_results_object(file_uuid=file_uuid)
    if result is None:
        print(f"[FILE OPERATIONS REPOSITORY] Domain Results for file_uuid: {file_uuid} is None. Was the file uploaded?")
        return None

    FileUploadsRecord.get_instance().vt_upload_result = result

    return result


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

