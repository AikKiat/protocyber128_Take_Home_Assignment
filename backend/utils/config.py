#Key system configurations, for example max file size accepted, and unknown file policies


from enum import Enum
import os
from dotenv import load_dotenv
load_dotenv()


class SystemSettings:

    _instance : SystemSettings = None

    #Max allowed size is 50mb
    _max_size = 50 * 1024 * 1024

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


    @max_size.setter
    def max_size(self, size_in_bytes : int):
        new_size = size_in_bytes * 1024 * 1024
        self._max_size = new_size


