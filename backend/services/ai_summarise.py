

from typing_extensions import Dict
from repository.file_uploads_record import get_current_upload_result
from ai.ai_call import run_ai

def summarise():
    current_upload_result : Dict = get_current_upload_result()
    print(current_upload_result)
    try:
        result = run_ai(raw_result=current_upload_result)
        summary = result.get("summarised_result", None)
        return summary
    
    except Exception as e:
        raise Exception(f"Failed to get summary : {e}")


