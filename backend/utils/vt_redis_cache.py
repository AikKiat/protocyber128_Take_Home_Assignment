
import redis
import json

class VTCache:
    def __init__(self):
        self.redis = redis.Redis(host="localhost", port=6379, decode_responses=True)

    # ---------- Pending ----------
    def set_pending(self, filename: str, analysis_id: str):
        self.redis.setex(f"vt:pending:{filename}", 3600, analysis_id)

    def get_pending(self, filename: str):
        return self.redis.get(f"vt:pending:{filename}")

    def clear_pending(self, filename: str):
        self.redis.delete(f"vt:pending:{filename}")



    # ---------- File Analysis Record ----------
    def set_filename_analysis_object(self, filename: str, obj: dict):
        self.redis.setex(f"vt:analysis:{filename}", 3600, json.dumps(obj))

    def get_filename_analysis_object(self, filename: str):
        data = self.redis.get(f"vt:analysis:{filename}")
        return json.loads(data) if data else None



    # ---------- File Object Record ----------
    def set_filename_file_object(self, filename: str, obj: dict):
        self.redis.setex(f"vt:file:{filename}", 3600, json.dumps(obj))

    def get_filename_file_object(self, filename: str):
        data = self.redis.get(f"vt:file:{filename}")
        return json.loads(data) if data else None
