# ai/build_context.py

from context_building.analysis_object_builder import build_analysis_context
from context_building.file_object_builder import build_file_context

def build_ai_context(raw_result: dict) -> dict:
    result_type = raw_result.get("type")

    if result_type == "analysis":
        return {
            "object_type": "VirusTotal Analysis Result",
            "context": build_analysis_context(raw_result)
        }

    if result_type == "file":
        return {
            "object_type": "VirusTotal File Report",
            "context": build_file_context(raw_result)
        }

    raise ValueError(f"Unsupported VirusTotal object type: {result_type}")
