#Key system configurations, for example max file size accepted, and unknown file policies


from constants import Types
import os
from dotenv import load_dotenv
load_dotenv()


class SystemSettings:

    _instance = None

    _current_focused_mode : str = Types.FULL_UPLOAD.value #defaulted to full upload

    #Max allowed size is 50mb
    _max_size = 50 * 1024 * 1024

    _query_interval = 10 #every 10 seconds

    def __init__(self):
        return ("This is a singleton. Access it via get_instance() instead")
    
    @classmethod
    def get_instance(cls):
        if cls._instance == None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    
    @property
    def max_size(self):
        return self._max_size
    
    @property
    def query_interval(self):
        return self._query_interval


    @property
    def current_focused_mode(self):
        return self._current_focused_mode
    
    @current_focused_mode.setter
    def current_focused_mode(self, value):
        if value == Types.FULL_UPLOAD.value or value == Types.HASH_BASED.value:
            self._current_focused_mode = value
        else:
            raise ValueError("[CONFIG] Value for m global focused mode switch is invalid.")

    @max_size.setter
    def max_size(self, size_in_bytes : int):
        new_size = size_in_bytes * 1024 * 1024
        self._max_size = new_size

    @query_interval.setter
    def query_interval(self, interval : int):
        if isinstance(interval, int):
            self._query_interval = interval
        else:
            raise ValueError("[CONFIG] Wrong value for query interval.")


