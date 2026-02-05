

from pydantic import BaseModel, Field
from constants import Catergory, Status, ThreatVerdict, ThreatSeverityLevel, SandboxCategory
from typing_extensions import Dict, List



#Response Body for GET /analyses/{id}

#==================
#SEQUENCE: UPLOAD FILE via POST /files --> returns a 200 OK, analysis Id. Use the Analysis ID --> GET /analysis/{id} to check on status
#==================

# date: <integer> Unix epoch UTC time (seconds).
# results: <dictionary> dictionary having the engine's name as key and its result as value. Its subfields are:
# category: <string> normalised result. Possible values are:
#     "confirmed-timeout" (AV reached a timeout when analysing that file. Only returned in file analyses.)
#     "timeout" (AV reached a timeout when analysing that file.)
#     "failure" (AV failed when analysing this file. Only returned in file analyses).
#     "harmless" (AV thinks the file is not malicious),
#     "undetected" (AV has no opinion about this file),
#     "suspicious" (AV thinks the file is suspicious),
#     "malicious" (AV thinks the file is malicious).
#     "type-unsupported" (AV can't analyse that file. Only returned in file analyses).
# engine_name: <string> the engine's name.
# engine_update: <string> the engine's update date in %Y%M%D format. Only returned in file analyses.
# engine_version: <string> the engine's version. Only returned in file analyses.
# method: <string> detection method.
# result: <string> engine result. If there's no verdict available, it can be null.
# stats: <dictionary> summary of the results field. It's subfields are:
# confirmed-timeout: <integer> number of AV engines that reach a timeout when analysing that file.
# failure: <integer> number of AV engines that fail when analysing that file.
# harmless: <integer> number of reports saying that is harmless.
# malicious: <integer> number of reports saying that is malicious.
# suspicious: <integer> number of reports saying that is suspicious.
# timeout: <integer> number of timeouts when analysing this URL/file.
# type-unsupported: <integer> number of AV engines that don't support that type of file.
# undetected: <integer> number of reports saying that is undetected.
# status: <string> analysis status. Possible values are:
#     "completed" (the analysis is finished).
#     "queued" (the item is waiting to be analysed, the analysis object has empty results and stats).
#     "in-progress" (the file is being analysed, the analysis object has partial analysis results and stats).





#=======================
#File Object returned from file report api endpoint
#SEQUENCE : Upload a file, get a file report via GET /files/{id} --> where {id} is the SHA-256, SHA-1 or MD5 identifying the file
#=======================
# capabilities_tags: <list of strings> list of representative tags related to the file's capabilities. Only available for Premium API users.
# creation_date: <integer> extracted when possible from the file's metadata. Indicates when it was built or compiled. It can also be faked by malware creators. UTC timestamp.
# downloadable: <boolean> true if the file can be downloaded, false otherwise. Only available for Premium API users.
# first_submission_date: <integer> date when the file was first seen in VirusTotal. UTC timestamp.
# last_analysis_date: <integer> most recent scan date. UTC timestamp.
# last_analysis_results: <dictionary> latest scan results. For more information about its format, check the Analysis object results attribute.
# last_analysis_stats: <dictionary> a summary of the latest scan results. For more information about its format, check the Analysis object stats attribute.
# last_modification_date: <integer> date when the object itself was last modified. UTC timestamp.
# last_submission_date: <integer> most recent date the file was posted to VirusTotal. UTC timestamp.
# main_icon: <dictionary> icon's relevant hashes, the dictionary contains two keys:
# raw_md5: <string> icon's MD5 hash.
# dhash: <string> icon's difference hash. It can be used to search for files with similar icons using the /intelligence/search endpoint.
# md5: <string> file's MD5 hash.
# meaningful_name: <string> the most interesting name out of all file's names.
# names: <list of strings> all file names associated with the file.
# reputation: <integer> file's score calculated from all votes posted by the VirusTotal community. To know more about how reputation is calculated, check this article.
# sandbox_verdicts: <dictionary> A summary of all sandbox verdicts:
# category: <string> normalized verdict category. It can be one of suspicious, malicious, harmless or undetected.
# confidence: <integer> verdict confidence from 0 to 100.
# malware_classification: <list of strings> raw sandbox verdicts.
# malware_names: <list of strings> malware family names.
# sandbox_name: <string> sandbox that provided the verdict.
# sha1: <string> file's SHA1 hash.
# sha256: <string> file's SHA256 hash.
# sigma_analysis_summary: <dictionary> dictionary containing the number of matched sigma rules group by its severity, same as sigma_analysis_stats but split by ruleset. Dictionary key is the ruleset name and value is the stats for that specific ruleset.
# size: <integer> file size in bytes.
# tags: <list of strings> list of representative attributes.
# times_submitted: <integer> number of times the file has been posted to VirusTotal.
# tlsh: <string> file's TLSH hash.
# permhash: <string> file's Permhash.
# total_votes: <dictionary> unweighted number of total votes from the community, divided in "harmless" and "malicious":
# harmless: <integer> number of positive votes.
# malicious: <integer> number of negative votes.
# type_description: <string> describes the file type.
# type_extension: <string> specifies file extension.
# type_tag: <string> tag representing the file type. Can be used to filter by file type in VirusTotal intelligence searches.
# type_tags: <list of strings> broader tags related to the specific file type, for instance, for a DLL this list would include - executable, windows, win32, pe, pedll. Can be used to filter in VirusTotal intelligence searches, all typetags get added to the _type search modifier.
# unique_sources: <integer> indicates from how many different sources the file has been posted from.
# vhash: <string> in-house similarity clustering algorithm value, based on a simple structural feature hash allows you to find similar files.
# crowdsourced_ai_results : <dictionary> A summary of all crowdsourced ai results:
# analysis : <string> Natural language summary of code snippets.
# source: <string> result source.
# id: <string> id of the crowdsourced_ai result.
# threat_verdict: <string>.
# VERDICT_UNKNOWN: we were not able to generate a verdict for this entity.
# VERDICT_UNDETECTED: no immediate evidence of malicious intent.
# VERDICT_SUSPICIOUS: possible malicious activity detected, requires further investigation.
# VERDICT_MALICIOUS: high confidence that the entity poses a threat.
# threat_severity: <dictionary>.
    # last_analysis_date: <int> timestamp when the threat severity was calculated.
    # threat_severity_level:
        # SEVERITY_NONE: this is the level assigned to entities with non-malicious verdict.
        # SEVERITY_LOW: the threat likely has a minor impact but should still be monitored
        # SEVERITY_MEDIUM: indicates a potential threat that warrants attention.
        # SEVERITY_HIGH: immediate action is recommended; the threat could have a critical impact
        # SEVERITY_UNKNOWN: not enough data to assess a severity.
    # level_description: <string> a human readable description of the signals that contributed to determine the severity level.
    # version: <int>
    # threat_severity_data: <dictionary>
        # popular_threat_category: <string> Popular_threat_category when the severity score was calculated.
        # type_tag: <string> File type when the severity score was calculated.
        # has_similar_files_with_detections: <bool> Files similar to this by vhash have detections.
        # is_matched_by_crowdsourced_yara_with_detections: <bool> At least 1 yara rule matching this file matches other files with detections.
        # has_vulnerabilities: <bool> The file is affected by CVE vulnerabilities.
        # can_be_detonated: <bool> The file has been characterized in sandboxes (behaviour).
        # has_legit_tag: <bool> The file has the 'legit' tag
        # num_gav_detections: <int> The number of Google antivirus detections
        # has_execution_parents_with_detections: <bool> Parent files have detections
        # has_dropped_files_with_detections: <bool> Dropped files have detections.
        # has_contacted_ips_with_detections: <bool> Has contacted IPs, domains and URLs with detections.
        # has_contacted_domains_with_detections: <bool>
        # has_contacted_urls_with_detections: <bool>
        # has_embedded_ips_with_detections: <bool> Has embedded IPs with detections.
        # has_embedded_domains_with_detections: <bool> Has embedded domains with detections.
        # has_embedded_urls_with_detections: <bool> Has embedded URLs with detections.
        # has_malware_configs: <bool>
        # has_references: <bool>
        # belongs_to_threat_actor: <bool>
        # belongs_to_bad_collection: <bool>
        # num_av_detections: <int> Number of regular AV detections if available.
        # has_bad_sandbox_verdicts: <bool>: The file has been identified as malicious in dynamic analysis.



class AnalysisResultMapper(BaseModel):
    date: int
    results: Dict
    category: Catergory
    engine_name: str
    engine_update: str 
    engine_version:str 
    method: str 
    result: str 
    stats: Dict 
    confirmed_timeout: Dict = Field(alias='confirmed-timeout') 
    failure: int 
    harmless: int
    malicious: int 
    suspicious: int 
    timeout: int 
    type_unsupported: int = Field(alias='type-supported') 
    undetected: int 
    status: Status


class FileReportMapper(BaseModel):
    capabilities_tags: List[str]
    creation_date: int
    downloadable: bool
    first_submission_date: int
    last_analysis_date: int
    last_analysis_results: dict
    last_analysis_stats: dict
    last_modification_date: int
    last_submission_date: int
    main_icon: MainIcon
    md5: str
    meaningful_name: str
    names: List[str]
    reputation: int
    sandbox_verdicts: SandboxVerdict
    sha1: str
    sha256: str
    sigma_analysis_summary: Dict
    size: int
    tags: List[str]
    times_submitted: int
    tlsh: str
    permhash: str
    total_votes: TotalVotes
    type_description: str
    type_extension: str
    type_tag: str
    type_tags: List[str]
    unique_sources: int
    vhash: int
    crowdsourced_ai_results : CrowdSourcedAIResults
    analysis : str
    source: str
    id: str
    threat_verdict: ThreatVerdict
    threat_severity: ThreatSeverity



class MainIcon(BaseModel):
    raw_md5 : str
    dhash : str

class SandboxVerdict(BaseModel):
    category: SandboxCategory
    confidence : int
    malware_classification: List[str]
    malware_names: List[str]
    sandbox_name: str


class TotalVotes(BaseModel):
    harmless : int
    malicious : int

class CrowdSourcedAIResults(BaseModel):
    analysis : str
    source : str
    id : str


class ThreatSeverity(BaseModel):
    last_analysis_date : int
    threat_severity_level : ThreatSeverityLevel
    level_description : str
    version : int
    threat_severity_data : ThreatSeverityData


class ThreatSeverityData(BaseModel):
    popular_threat_category:str 
    type_tag:str 
    has_similar_files_with_detections:bool 
    is_matched_by_crowdsourced_yara_with_detections:bool 
    has_vulnerabilities: bool 
    can_be_detonated:bool 
    has_legit_tag:bool 
    num_gav_detections:int 
    has_execution_parents_with_detections:bool 
    has_dropped_files_with_detections:bool 
    has_contacted_ips_with_detections:bool  
    has_contacted_domains_with_detections:bool
    has_contacted_urls_with_detections:bool
    has_embedded_ips_with_detections:bool 
    has_embedded_domains_with_detections:bool 
    has_embedded_urls_with_detections : bool
    has_malware_configs : bool
    has_references : bool
    belongs_to_threat_actor : bool
    belongs_to_bad_collection :bool
    num_av_detections : int 
    has_bad_sandbox_verdicts : bool
