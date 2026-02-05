from entities.file_upload_analysis import AnalysisResponse
from entities.file_report import FileResponse


def parse_analysis(response_json: dict) -> AnalysisResponse:
    return AnalysisResponse(**response_json["data"])


def parse_file(response_json: dict) -> FileResponse:
    return FileResponse(**response_json["data"])
