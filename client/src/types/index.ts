// API Response wrappers
export interface APIResponse<T> {
  status: number;
  result: T;
  message?: string;
}

// Upload modes
export type UploadMode = 'quick' | 'full';



// Combined result type
export type ScanResult = FileObject | AnalysisObject;


// File Upload Response (Full Scan)
export interface AnalysisResponse {
    filename: string;
    uuid: string;
    found: boolean;
    result : string | AnalysisObject;
}


// Analysis Object
export interface AnalysisObject{
    id: string;
    type: string;
    attributes: AnalysisAttributes;
    links?: {
        self: string;
        item?: string;
    };
}


//Analysis Attributes (Key information)
export interface AnalysisAttributes {
  date: number;
  status: AnalysisStatus;
  results: Record<string, EngineResult>;
  stats: AnalysisStats;
}

export type AnalysisStatus = 'completed' | 'queued' | 'in-progress';



export interface EngineResult {
  category: string;
  engine_name: string;
  engine_version?: string;
  engine_update?: string;
  method?: string;
  result?: string | null;
}

export interface AnalysisStats {
  'confirmed-timeout'?: number;
  failure?: number;
  harmless?: number;
  malicious?: number;
  suspicious?: number;
  timeout?: number;
  'type-unsupported'?: number;
  undetected?: number;
}





// File Object (Quick Scan)


// {"filename" : filename, "uuid": _uuid, "found" : False, "result" : file_object}
export interface FileResponse {
    filename : string;
    uuid : string;
    found : boolean;
    result : FileObject;
}

export interface FileObject{
    id: string;
    type: string;
    attributes: FileAttributes;
    links?: {
        self: string;
    };
}

export interface FileAttributes {
  md5?: string;
  sha1?: string;
  sha256?: string;
  size?: number;
  type_description?: string;
  type_extension?: string;
  type_tag?: string;
  type_tags?: string[];
  names?: string[];
  meaningful_name?: string;
  creation_date?: number | null;
  first_submission_date?: number;
  last_submission_date?: number;
  last_analysis_date?: number;
  last_modification_date?: number;
  last_analysis_stats?: AnalysisStats;
  last_analysis_results?: Record<string, EngineResult>;
  reputation?: number;
  total_votes?: {
    harmless: number;
    malicious: number;
  };
  tags?: string[];
  capabilities_tags?: string[] | null;
  sandbox_verdicts?: any;
  main_icon?: any;
  tlsh?: string;
  permhash?: string | null;
  vhash?: string | null;
  unique_sources?: number;
  times_submitted?: number;

  threat_verdict?: string | null;
  threat_severity?: ThreatSeverity; // ✅ FIXED
}


export interface ThreatSeverity {
  last_analysis_date?: number;
  threat_severity_level?: ThreatSeverityLevel;
  level_description?: string;
  version?: number;
  threat_severity_data?: ThreatSeverityData;
}


export type ThreatSeverityLevel = "SEVERITY_NONE" | "SEVERITY_LOW" | "SEVERITY_MEDIUM" | "SEVERITY_HIGH"| "SEVERITY_UNKNOWN"


//THREAT SEVERITY
export interface ThreatSeverityData {
  popular_threat_category?: string;
  type_tag?: string;

  has_similar_files_with_detections?: boolean;
  is_matched_by_crowdsourced_yara_with_detections?: boolean;
  has_vulnerabilities?: boolean;
  can_be_detonated?: boolean;
  has_legit_tag?: boolean;

  num_gav_detections?: number;
  num_av_detections?: number;

  has_execution_parents_with_detections?: boolean;
  has_dropped_files_with_detections?: boolean;
  has_contacted_ips_with_detections?: boolean;
  has_contacted_domains_with_detections?: boolean;
  has_contacted_urls_with_detections?: boolean;
  has_embedded_ips_with_detections?: boolean;
  has_embedded_domains_with_detections?: boolean;
  has_embedded_urls_with_detections?: boolean;

  has_malware_configs?: boolean;
  has_references?: boolean;
  belongs_to_threat_actor?: boolean;
  belongs_to_bad_collection?: boolean;

  has_bad_sandbox_verdicts?: boolean;
}


// File History Item (For browser in-memory storage only)
export interface FileHistoryItem {
  uuid: string;
  filename: string;
  timestamp: number;
  fileType: string;
  scanMode: UploadMode;
  aiSummary?: string; // Cached AI summary for this file
  aiLoading?: boolean; // Whether AI summary is currently being generated
}




//CONTEXT DATA FOR FRONTEND PRESENTATION

export interface ResultContext {
  raw: ScanResult | null;
  filename: string | null;

  isFile: boolean;
  isAnalysis: boolean;

  file?: FileContext;
  analysis?: AnalysisContext;
}



export interface ThreatSignals {
  detection: {
    percentage: number;
    level: 'safe' | 'warning' | 'danger';
    malicious: number;
    suspicious: number;
    total: number;
  };

  reputation: {
    verdict?: string | null;
    isHighRisk: boolean;
    confidence: number; // 0–100 heuristic
  };

  final: {
    level: 'safe' | 'warning' | 'danger';
    explanation: string;
  };
}



export interface FileContext {
  identity: {
    filename: string;
    meaningfulName?: string;
    typeDescription?: string;
    extension?: string;
    sizeBytes?: number;
  };

  hashes: {
    md5?: string;
    sha1?: string;
    sha256?: string;
    tlsh?: string;
    vhash?: string;
    permhash?: string;
  };

  reputation: {
    score: number;
    communityVotes?: {
      harmless: number;
      malicious: number;
    };
  };

  submissions: {
    timesSubmitted?: number;
    uniqueSources?: number;
  };

  timeline: {
    creationDate?: number | null;
    firstSubmissionDate?: number;
    lastSubmissionDate?: number;
    lastAnalysisDate?: number;
  };

  detections: {
    engines: {
      malicious: number;
      suspicious: number;
      harmless: number;
      undetected: number;
      unsupported?: number;
      total: number;
    };
    threatPercentage: number;
    threatLevel: 'safe' | 'warning' | 'danger';
  };

  threatSeverity?: {
    level?: ThreatSeverityLevel;
    description?: string;
    indicators?: ThreatSeverityData;
  };

  tags?: string[];
  typeTags?: string[];

  sandboxVerdicts?: Array<{
    engine: string;
    category: string;
  }>;

  knownNames?: string[];
}


export interface AnalysisContext {
  identity: {
    id: string;
    filename?: string | null;
  };

  status: {
    state: 'completed' | 'queued' | 'in-progress';
    scanDate: number;
  };

  detections: {
    engines: {
      malicious: number;
      suspicious: number;
      harmless: number;
      undetected: number;
      unsupported: number;
      failures: number;
      total: number;
    };
    threatPercentage: number;
    threatLevel: 'safe' | 'warning' | 'danger';
  };

  flaggedEngines: Array<{
    engine: string;
    category: 'malicious' | 'suspicious';
    method?: string;
    result?: string | null;
  }>;

  timeouts?: {
    timeout?: number;
    confirmedTimeout?: number;
  };
}





export type SavedFileResultsResponse = {
  status : string;
  result : FileObject | AnalysisObject;
};

// AI Summary
export interface AISummaryResponse {
  status: number;
  result: string;
}
