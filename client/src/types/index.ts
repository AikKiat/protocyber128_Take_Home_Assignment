// API Response wrappers
export interface APIResponse<T> {
  status: number;
  result: T;
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
  threat_severity?: any;
}

// File History Item (For browser in-memory storage only)
export interface FileHistoryItem {
  uuid: string;
  filename: string;
  timestamp: number;
  fileType: string;
  scanMode: UploadMode;
}

// Context Builders (Key information)
export interface FileContext {
  fileIdentity: {
    name?: string;
    type?: string;
    extension?: string;
    size_bytes?: number;
  };
  hashes: {
    md5?: string;
    sha256?: string;
  };
  reputation: {
    score?: number;
    votes?: {
      harmless: number;
      malicious: number;
    };
  };
  analysis_summary?: AnalysisStats;
  threat_indicators: {
    sandbox_verdicts?: any;
    threat_verdict?: string | null;
    threat_severity?: any;
  };
  tags?: string[];
}

export interface AnalysisContext {
  analysis_status: AnalysisStatus;
  scan_date: number;
  engine_summary: {
    malicious: number;
    suspicious: number;
    undetected: number;
    unsupported: number;
    failures: number;
  };
  flagged_engines: Array<{
    engine: string;
    category: string;
    method?: string;
  }>;
}




export type SavedFileResultsResponse = {
  [Mode in UploadMode]: AnalysisObject | FileObject;
};

export type ModeSelectionResult ={
  toggle_mode : string;
  result : AnalysisObject | FileObject;
}





// AI Summary
export interface AISummaryResponse {
  status: number;
  result: string;
}
