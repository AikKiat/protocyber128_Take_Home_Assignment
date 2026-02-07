

from vt_api_mappers.vt_get_analysis import AnalysisResponsePayload

def parse_analysis_object(response_json: dict) -> AnalysisResponsePayload:
    return AnalysisResponsePayload(**response_json)

