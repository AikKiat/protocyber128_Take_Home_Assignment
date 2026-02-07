

from api.vt_get_analysis import AnalysisResponsePayload

def parse_analysis_object(response_json: dict) -> AnalysisResponsePayload:
    return AnalysisResponsePayload(**response_json["data"])

