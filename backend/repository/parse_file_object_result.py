

from vt_api_mappers.vt_get_file_report import FileResponsePayload

def parse_file_object(response_json: dict) -> FileResponsePayload:
    return FileResponsePayload(**response_json)
