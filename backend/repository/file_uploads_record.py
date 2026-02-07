

from domain.file_uploads_record import FileUploadsRecord
from vt_api_mappers.vt_get_analysis import AnalysisResponsePayload
from vt_api_mappers.vt_get_file_report import FileResponsePayload


def check_in_upload_records(_uuid : str):
    if _uuid in FileUploadsRecord.get_instance().uuid_filename_mappings:
        return True
    return False

async def retrieve_full_results(filename : str):
    return await FileUploadsRecord.get_instance().get_analysis_object(filename=filename)

async def retrieve_hash_results(filename : str):
    return await FileUploadsRecord.get_instance().get_file_object(filename=filename)

def add_filename_analysis_id_pair(filename : str, analysis_id : str):
    FileUploadsRecord.get_instance().add_to_files_pending_analysis(filename=filename, analysis_id=analysis_id)

def get_analysis_id_for_filename(filename : str):
    FileUploadsRecord.get_instance().get_analysis_id_for_filename(filename=filename)



async def store_result_from_file_hash(filename, result : FileResponsePayload):
    await FileUploadsRecord.get_instance().store_file_hash_result(filename=filename, result_from_hash=result)

async def store_result_from_full_analysis(filename, result : AnalysisResponsePayload):
    await FileUploadsRecord.get_instance().store_analysis_result(filename=filename, analysis_result=result)



def get_current_upload_result():
    return FileUploadsRecord.get_instance().vt_upload_result

def set_current_upload_result(upload_result : FileResponsePayload | AnalysisResponsePayload):
    FileUploadsRecord.get_instance().vt_upload_result = upload_result




def get_filename_for_uuid(uuid : str):
    return FileUploadsRecord.get_instance().get_filename_for_uuid(uuid=uuid)

def add_to_uuid_filename_record(filename : str, _uuid : str):
    return FileUploadsRecord.get_instance().add_to_uuid_filename_record(filename=filename, _uuid = _uuid)


def get_current_filename():
    return FileUploadsRecord.get_instance().current_filename

def set_current_filename(filename : str):
    FileUploadsRecord.get_instance().current_filename = filename

