

from vt_api_mappers.vt_get_file_report import FileResponsePayload
from vt_api_mappers.vt_get_analysis import AnalysisResponsePayload
from repository.file_uploads_record import get_current_upload_result
from ai.ai_call import run_ai_call

def summarise():
    current_upload_result : FileResponsePayload | AnalysisResponsePayload = get_current_upload_result()
    try:
        result = run_ai_call(raw_result=current_upload_result)
        summary = result.get("summarised_result", None)
        return summary
    
    except Exception as e:
        raise Exception(f"Failed to get summary : {e}")


