import type {
  FileResponse,
  AnalysisResponse,
  FileContext,
  AnalysisContext,
  AnalysisStats,
  FileObject,
  AnalysisObject,
} from '../types';

/**
 * Build file context from file object (matches backend build_file_context)
 */
export const buildFileContext = (fileObject : FileObject): FileContext => {
  const attrs = fileObject.attributes;

  return {
    fileIdentity: {
      name: attrs.meaningful_name,
      type: attrs.type_description,
      extension: attrs.type_extension,
      size_bytes: attrs.size,
    },
    hashes: {
      md5: attrs.md5,
      sha256: attrs.sha256,
    },
    reputation: {
      score: attrs.reputation,
      votes: attrs.total_votes,
    },
    analysis_summary: attrs.last_analysis_stats,
    threat_indicators: {
      sandbox_verdicts: attrs.sandbox_verdicts,
      threat_verdict: attrs.threat_verdict,
      threat_severity: attrs.threat_severity,
    },
    tags: attrs.tags,
  };
};

/**
 * Build analysis context from analysis object (matches backend build_analysis_context)
 */
export const buildAnalysisContext = (analysisObject: AnalysisObject): AnalysisContext => {
  const attrs = analysisObject.attributes;
  const stats = attrs.stats || {};
  const results = attrs.results || {};

  // Get flagged engines (malicious, suspicious, failure)
  const flaggedEngines = Object.entries(results)
    .filter(([_, r]) =>
      ['malicious', 'suspicious', 'failure'].includes(r.category)
    )
    .map(([name, r]) => ({
      engine: name,
      category: r.category,
      method: r.method,
    }))
    .slice(0, 5); // Limit to 5

  return {
    analysis_status: attrs.status,
    scan_date: attrs.date,
    engine_summary: {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      undetected: stats.undetected || 0,
      unsupported: stats['type-unsupported'] || 0,
      failures: stats.failure || 0,
    },
    flagged_engines: flaggedEngines,
  };
};

/**
 * Get total scan count from stats
 */
export const getTotalScanCount = (stats: AnalysisStats | undefined): number => {
  if (!stats) return 0;

  return (
    (stats.malicious || 0) +
    (stats.suspicious || 0) +
    (stats.harmless || 0) +
    (stats.undetected || 0)
  );
};

/**
 * Calculate threat percentage
 */
export const getThreatPercentage = (stats: AnalysisStats | undefined): number => {
  if (!stats) return 0;

  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const total = getTotalScanCount(stats);

  if (total === 0) return 0;

  return Math.round(((malicious + suspicious) / total) * 100);
};

/**
 * Get threat level based on stats
 */
export const getThreatLevel = (stats: AnalysisStats | undefined): string => {
  if (!stats) return 'unknown';

  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;

  if (malicious > 0) return 'danger';
  if (suspicious > 0) return 'warning';
  return 'safe';
};
