#Key system configurations, for example max file size accepted, and unknown file policies


from enum import Enum
import os

class UnknownFilePolicy(str, Enum):
    BLOCK = "block"
    UPLOAD = "upload"

FILE_UPLOAD_POLICY = UnknownFilePolicy(os.getenv("UNKNOWN_FILE_POLICY", "block"))


#Max allowed size is 50mb
MAX_FILE_SIZE = 50 * 1024 * 1024
BASE_URL = os.getenv("BASE_URL")
VT_API_KEY = os.getenv("VT_API_KEY")

