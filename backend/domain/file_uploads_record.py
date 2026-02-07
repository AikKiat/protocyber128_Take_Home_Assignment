
from typing_extensions import Dict, List
from custom_exceptions import ResourceNotFound
from vt_api_mappers.vt_get_analysis import AnalysisResponsePayload
from vt_api_mappers.vt_get_file_report import FileResponsePayload

from utils.vt_redis_cache import VTCache


#For uploading the file to VT Database.
class FileUploadsRecord:

    _instance : FileUploadsRecord = None

    """
    Filename --> Full upload record, hash brief record


    1. Filename, can be mapped to 3 different records:
    --> Filename -> analysis_id (for files that have not been scanned fully by vt)
    --> Filename -> Analysis Object (for files already scanned fully by vt)
    --> Filename -> File object (for files sent to vt for hash based scanning)
    
    """

    filename_to_analysis_ids : Dict[str, str] = {}

    uuid_filename_mappings : Dict[str, str] = {} #maps uuid -> filename

    _vt_upload_result : FileResponsePayload | AnalysisResponsePayload = None  #anytime, this variable can embody both the result from parsing fully to file, or from file's hash.
    _ai_summary : str = None
    _current_filename : str = None

    def __init__(self):
        return ("This is a Singleton. Call it via get_instance() instead.")
    
    @classmethod
    def get_instance(cls):
        if cls._instance == None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    

    #Only done if the file is a new file, not scanned before.
    def add_to_files_pending_analysis(self, filename, analysis_id):
        self.upload_records.append(filename)
        self.filename_to_analysis_ids[filename] = analysis_id

    def get_analysis_id_for_filename(self,filename : str):
        if filename in self.filename_to_analysis_ids:
            return self.filename_to_analysis_ids[filename]
        raise ResourceNotFound("Filename not found in the records of analysis id and filename.")
    

    def add_to_uuid_filename_record(self, filename : str, _uuid : str):
        if _uuid in self.uuid_filename_mappings and self.uuid_filename_mappings[_uuid] == filename:
            print("[FILE_UPLOAD_RECORDS_DOMAIN] uuid and filename already present")
        elif _uuid in self.uuid_filename_mappings and self.uuid_filename_mappings[_uuid] != filename:
            raise ValueError("[FILE_UPLOAD_RECORDS_DOMAIN] uuid is already set in upload store but points to a different filename")
        else:
            self.uuid_filename_mappings[_uuid] = filename
            print("[FILE_UPLOAD_RECORDS_DOMAIN] uuid and filename successfully mapped.")

    
    @property
    def vt_upload_result(self):
        return self._vt_upload_result
    
    @vt_upload_result.setter
    def vt_upload_result(self, value):
        self._vt_upload_result = value



    @property
    def upload_records(self):
        return self._upload_records


    @property
    def current_filename(self):
        return self._current_filename


    @current_filename.setter
    def current_filename(self, value):
        self._current_filename = value
    
    @property
    def upload_summary(self):
        return self._upload_summary
    
    @upload_summary.setter
    def upload_summary(self, value):
        self.current_upload_summary = value



    def get_filename_for_uuid(self, uuid : str):
        if uuid not in self.uuid_filename_mappings:
            raise ResourceNotFound("Filename not found in UUID mappings.")
        
        return self.uuid_filename_mappings[uuid]


    #Cache logic (Using methods exposed for Redis Cache)

    async def get_analysis_object(self, filename : str):
        vtcache = VTCache()
        return vtcache.get_filename_analysis_object(filename=filename)

    async def get_file_object(self, filename : str):
        vtcache = VTCache()
        return vtcache.get_filename_file_object(filename=filename)



    #We store into cache, and update the current showing one at the same time.
    async def store_analysis_result(self, filename, analysis_result):
        vtcache = VTCache()
        await vtcache.set_filename_analysis_object(filename=filename, obj=analysis_result)

    async def store_file_hash_result(self, filename, result_from_hash):
        vtcache = VTCache()
        await vtcache.set_filename_file_object(filename=filename, obj=result_from_hash)


    
