

#Used to get the Hash for the particular file before upload, 
#check in VirusTotal filescanner's internal database for similar results that have occured, 
#and then a preliminary analysis can be returned from there without even directlly uploading the file to VirusTotal 
#and putting it in temporal storage.


import hashlib
from fastapi import UploadFile
import tempfile, os, shutil

def retrieve_file_hash(file : UploadFile) -> str:

    try:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temporary_path = tmp.name

            hash = hashlib.sha256()
            with open(temporary_path, "rb") as f :
                for eight_byte_chunk in iter(lambda : f.read(8192), b""):
                    hash.update(eight_byte_chunk)
            return hash.hexdigest() #returns the message digest value, as hexadecimal
        
    except Exception as e:
        print(f"Failed to hash file, {e}")

    finally: #clean up, remove file from temporary storage
        if temporary_path and os.path.exists(temporary_path):
            os.unlink(temporary_path)


