

#Used to get the Hash for the particular file before upload, 
#check in VirusTotal filescanner's internal database for similar results that have occured, 
#and then a preliminary analysis can be returned from there without even directlly uploading the file to VirusTotal 
#and putting it in temporal storage.


import hashlib

def hash_sha256(path : str) -> str:
    hash = hashlib.sha256()
    with open(path, "rb") as f :
        for eight_byte_chunk in iter(lambda : f.read(8192), b""):
            hash.update(eight_byte_chunk)
    return hash.hexdigest() #returns the message digest value, as hexadecimal


print(hash_sha256("../../files/jquery-3.5.1.min.js"))


