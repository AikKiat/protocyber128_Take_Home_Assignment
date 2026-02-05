from typing import Optional, List, Dict
from entities.common import VTBaseModel
from constants import SandboxCategory, ThreatVerdict, ThreatSeverityLevel


class MainIcon(VTBaseModel):
    raw_md5: Optional[str]
    dhash: Optional[str]


class SandboxVerdict(VTBaseModel):
    category: SandboxCategory
    confidence: Optional[int]
    malware_classification: Optional[List[str]]
    malware_names: Optional[List[str]]
    sandbox_name: str


class TotalVotes(VTBaseModel):
    harmless: int = 0
    malicious: int = 0


class ThreatSeverityData(VTBaseModel):
    popular_threat_category: Optional[str]
    type_tag: Optional[str]
    has_similar_files_with_detections: Optional[bool]
    is_matched_by_crowdsourced_yara_with_detections: Optional[bool]
    has_vulnerabilities: Optional[bool]
    can_be_detonated: Optional[bool]
    has_legit_tag: Optional[bool]
    num_gav_detections: Optional[int]
    has_execution_parents_with_detections: Optional[bool]
    has_dropped_files_with_detections: Optional[bool]
    has_contacted_ips_with_detections: Optional[bool]
    has_contacted_domains_with_detections: Optional[bool]
    has_contacted_urls_with_detections: Optional[bool]
    has_embedded_ips_with_detections: Optional[bool]
    has_embedded_domains_with_detections: Optional[bool]
    has_embedded_urls_with_detections: Optional[bool]
    has_malware_configs: Optional[bool]
    has_references: Optional[bool]
    belongs_to_threat_actor: Optional[bool]
    belongs_to_bad_collection: Optional[bool]
    num_av_detections: Optional[int]
    has_bad_sandbox_verdicts: Optional[bool]


class ThreatSeverity(VTBaseModel):
    last_analysis_date: Optional[int]
    threat_severity_level: ThreatSeverityLevel
    level_description: Optional[str]
    version: Optional[int]
    threat_severity_data: Optional[ThreatSeverityData]


class FileAttributes(VTBaseModel):
    md5: Optional[str]
    sha1: Optional[str]
    sha256: Optional[str]

    size: Optional[int]
    type_description: Optional[str]
    type_extension: Optional[str]
    type_tag: Optional[str]
    type_tags: Optional[List[str]]

    names: Optional[List[str]]
    meaningful_name: Optional[str]

    creation_date: Optional[int]
    first_submission_date: Optional[int]
    last_submission_date: Optional[int]
    last_analysis_date: Optional[int]
    last_modification_date: Optional[int]

    last_analysis_stats: Optional[Dict]
    last_analysis_results: Optional[Dict]

    reputation: Optional[int]
    total_votes: Optional[TotalVotes]

    tags: Optional[List[str]]
    capabilities_tags: Optional[List[str]]
    sandbox_verdicts: Optional[Dict[str, SandboxVerdict]]

    main_icon: Optional[MainIcon]
    tlsh: Optional[str]
    permhash: Optional[str]
    vhash: Optional[str]
    unique_sources: Optional[int]
    times_submitted: Optional[int]

    threat_verdict: Optional[ThreatVerdict]
    threat_severity: Optional[ThreatSeverity]


class FileResponse(VTBaseModel):
    id: str
    type: str
    attributes: FileAttributes
