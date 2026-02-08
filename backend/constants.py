

from typing_extensions import Dict
from enum import Enum
import hashlib


"""
[VIRUS TOTAL API] RESPONSE MAPPINGS
"""


#---FOR GET /analysis/{id}
class Category(Enum):
    CONFIRMED_TIMEOUT = "confirmed-timeout" #"(AV reached a timeout when analysing that file. Only returned in file analyses.)",
    TIMEOUT = "timeout" #"(AV reached a timeout when analysing that file.)",
    FAILURE = "failure" #(AV failed when analysing this file. Only returned in file analyses).
    HARMLES = "harmless" #(AV thinks the file is not malicious),
    UNDETECTED = "undetected" #(AV has no opinion about this file),
    SUSPICIOUS = "suspicious" #(AV thinks the file is suspicious),
    MALICIOUS = "malicious" #(AV thinks the file is malicious).
    TYPE_SUPPORTED = "type-unsupported" #(AV can't analyse that file. Only returned in file analyses).   

class Status(Enum):
    COMPLETED = "completed"
    QUEUED = "queued"
    IN_PROGRESS = "in-progress"            
#---END GET /analysis/{id}





#---FOR GET /files/{id}, where id is the SHA-256, SHA-1, or MD5 hash identifying the file

class ThreatSeverityLevel(Enum):
    SEVERITY_NONE = "SEVERITY_NONE"
    SEVERITY_LOW ="SEVERITY_LOW"
    SEVERITY_MEDIUM ="SEVERITY_MEDIUM"
    SEVERITY_HIGH ="SEVERITY_HIGH"
    SEVERITY_UNKNOWN ="SEVERITY_UNKNOWN"

class ThreatVerdict(Enum):
    VERDICT_UNKNOWN = "VERDICT_UNKNOWN"
    VERDICT_UNDETECTED = "VERDICT_UNDETECTED"
    VERDICT_SUSPICIOUS = "VERDICT_SUSPICIOUS"
    VERDICT_MALICIOUS = "VERDICT_MALICIOUS" 

class SandboxCategory(Enum):
    SUSPICIOUS = "suspicious"
    MALICIOUS = "malicious"
    HARMLESS = "harmless"
    UNDETECTED = "undetected"

#---END GET /files/{id}


class Types(Enum):
    HASH_BASED = "quick"
    FULL_UPLOAD = "full"



















"""
[HASHING] SPECIFIED HASH FUNCTIONS OUTPUT SUPPORTED BY VIRUSTOTAL
"""

class HashFunctions(Enum):
    SHA_256 = (hashlib.sha256(),)
    MD5 = (hashlib.md5(),)
    SHA_1 = (hashlib.sha1(),)


















"""
[AI] KEYWORD REFERENCES FOR THE AI MODULE
"""

catergory_reference_lookup : Dict[str, str] = {
    "confirmed-timeout" : "(AV reached a timeout when analysing that file. Only returned in file analyses.)",
    "timeout" : "(AV reached a timeout when analysing that file.)",
    "failure" : "(AV failed when analysing this file. Only returned in file analyses).",
    "harmless" : "(AV thinks the file is not malicious)",
    "undetected" : "(AV has no opinion about this file)",
    "suspicious" : "(AV thinks the file is suspicious)",
    "malicious" : "(AV thinks the file is malicious)",
    "type-unsupported" : "(AV can't analyse that file. Only returned in file analyses)"
}

threat_severity_data_reference_lookup : Dict[str, str] = {
    "popular_threat_category": "<string> Popular_threat_category when the severity score was calculated.",
    "type_tag" :  "<string> File type when the severity score was calculated.",
    "has_similar_files_with_detections" :  "<bool> Files similar to this by vhash have detections.",
    "is_matched_by_crowdsourced_yara_with_detections" :  "<bool> At least 1 yara rule matching this file matches other files with detections.",
    "has_vulnerabilities" :  "<bool> The file is affected by CVE vulnerabilities.",
    "can_be_detonated" :  "<bool> The file has been characterized in sandboxes (behaviour).",
    "has_legit_tag" :  "<bool> The file has the 'legit' tag",
    "num_gav_detections" :  "<int> The number of Google antivirus detections",
    "has_execution_parents_with_detections" :  "<bool> Parent files have detections",
    "has_dropped_files_with_detections" :  "<bool> Dropped files have detections.",
    "has_contacted_ips_with_detections" :  "<bool> Has contacted IPs, domains and URLs with detections.",
    "has_contacted_domains_with_detections" :  "<bool>",
    "has_contacted_urls_with_detections" :  "<bool>",
    "has_embedded_ips_with_detections" :  "<bool> Has embedded IPs with detections.",
    "has_embedded_domains_with_detections" :  "<bool> Has embedded domains with detections.",
    "has_embedded_urls_with_detections" :  "<bool> Has embedded URLs with detections.",
    "has_malware_configs" :  "<bool>",
    "has_references" :  "<bool>",
    "belongs_to_threat_actor" :  "<bool>",
    "belongs_to_bad_collection" :  "<bool>",
    "num_av_detections" :  "<int> Number of regular AV detections if available.",
    "has_bad_sandbox_verdicts" :  "<bool>: The file has been identified as malicious in dynamic analysis."
}

threat_verdict_reference_lookup : Dict[str, str] = {
    "VERDICT_UNKNOWN" :  "we were not able to generate a verdict for this entity.",
    "VERDICT_UNDETECTED" :  "no immediate evidence of malicious intent.",
    "VERDICT_SUSPICIOUS" :  "possible malicious activity detected, requires further investigation.",
    "VERDICT_MALICIOUS" : "high confidence that the entity poses a threat."
}

severity_catergories_reference_lookup: Dict[str, str] ={
    "SEVERITY_NONE": "this is the level assigned to entities with non-malicious verdict.",
    "SEVERITY_LOW": "the threat likely has a minor impact but should still be monitored",
    "SEVERITY_MEDIUM": "indicates a potential threat that warrants attention.",
    "SEVERITY_HIGH": "immediate action is recommended; the threat could have a critical impact",
    "SEVERITY_UNKNOWN": "not enough data to assess a severity."
}



