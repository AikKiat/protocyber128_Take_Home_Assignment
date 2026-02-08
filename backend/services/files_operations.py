
from repository.file_uploads_record import (
    retrieve_saved_result,
    store_result,
    set_current_file_uuid)

from utils.config import SystemSettings
from typing_extensions import Dict


def get_results_for_file_uuid(file_uuid : str):

    set_current_file_uuid(file_uuid=file_uuid)
    
    saved_result : Dict = retrieve_saved_result(file_uuid=file_uuid)
    return saved_result


def toggle_modes(type : str):
    SystemSettings.get_instance().current_focused_mode = type
    return {"toggled_mode" : type}