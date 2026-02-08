
import redis
import json
import os
from dotenv import load_dotenv
load_dotenv()

REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
REDIS_PORT = int(os.getenv("REDIS_PORT"))
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_USERNAME = os.getenv("REDIS_USERNAME")

class VTCache:
    def __init__(self):
        self.redis = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, decode_responses=True, username=REDIS_USERNAME)

    # ---------- Pending ----------
    def set_pending(self, filename: str, analysis_id: str):
        self.redis.setex(f"vt:pending:{filename}", 3600, analysis_id)

    def get_pending(self, filename: str):
        return self.redis.get(f"vt:pending:{filename}")

    def clear_pending(self, filename: str):
        self.redis.delete(f"vt:pending:{filename}")



    def set_saved_object(self, file_uuid: str, json: dict):
        self.redis.setex(f"vt:{file_uuid}", 3600, json)

    def get_saved_object(self, file_uuid: str):
        data = self.redis.get(f"vt:{file_uuid}")
        if data is None:
            print(f"[REDIS CACHE] Data is none for file_uuid of {file_uuid}.")
            return None
        
        data = json.loads(data)
        if isinstance(data, str):
            data = json.loads(data)
        return data
