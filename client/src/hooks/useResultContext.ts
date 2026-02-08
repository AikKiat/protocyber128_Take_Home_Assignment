import { useMemo } from 'react';
import type {
  ScanResult,
  FileObject,
  AnalysisObject,
  ResultContext,
} from '../types';

export const useResultContext = (
  result: ScanResult | null,
  filename: string | null
): ResultContext => {
  return useMemo(() => {
    if (!result) {
      return {
        raw: null,
        filename,
        isFile: false,
        isAnalysis: false,
      };
    }

    // ================= FILE CONTEXT =================
if (result.type === 'file') {
  const file = result as FileObject;
  const a = file.attributes;

  const stats = a.last_analysis_stats ?? {
    malicious: 0,
    suspicious: 0,
    harmless: 0,
    undetected: 0,
  };

  const malicious = stats.malicious ?? 0;
  const suspicious = stats.suspicious ?? 0;
  const harmless = stats.harmless ?? 0;
  const undetected = stats.undetected ?? 0;

  const total =
    malicious + suspicious + harmless + undetected;

  const threatPercentage =
    total > 0
      ? Math.round(((malicious + suspicious) / total) * 100)
      : 0;

  const threatLevel: 'safe' | 'warning' | 'danger' =
    malicious > 0
      ? 'danger'
      : suspicious > 0
      ? 'warning'
      : 'safe';

  return {
    raw: result,
    filename,
    isFile: true,
    isAnalysis: false,

    file: {
      // ---------- Identity ----------
      identity: {
        filename:
          a.meaningful_name ||
          a.names?.[0] ||
          filename ||
          'Unknown file',
        meaningfulName: a.meaningful_name,
        typeDescription: a.type_description || a.type_tag,
        extension: a.type_extension,
        sizeBytes: a.size,
      },

      // ---------- Cryptographic Hashes ----------
      hashes: {
        md5: a.md5 ?? undefined,
        sha1: a.sha1 ?? undefined,
        sha256: a.sha256 ?? undefined,
        tlsh: a.tlsh ?? undefined,
        vhash: a.vhash ?? undefined,
        permhash: a.permhash ?? undefined,
      },

      // ---------- Reputation & Crowd Signal ----------
      reputation: {
        score: a.reputation ?? 0,
        communityVotes: a.total_votes
          ? {
              harmless: a.total_votes.harmless ?? 0,
              malicious: a.total_votes.malicious ?? 0,
            }
          : undefined,
      },

      // ---------- Submission Metadata ----------
      submissions: {
        timesSubmitted: a.times_submitted,
        uniqueSources: a.unique_sources,
      },

      // ---------- Timeline ----------
      timeline: {
        creationDate: a.creation_date ?? null,
        firstSubmissionDate: a.first_submission_date,
        lastSubmissionDate: a.last_submission_date,
        lastAnalysisDate: a.last_analysis_date,
      },

      // ---------- Engine Detections ----------
      detections: {
        engines: {
          malicious,
          suspicious,
          harmless,
          undetected,
          total,
        },
        threatPercentage,
        threatLevel,
      },

      // ---------- Sandbox (Dynamic Analysis) ----------
      sandboxVerdicts: a.sandbox_verdicts
        ? Object.entries(a.sandbox_verdicts).map(
            ([engine, verdict]: [string, any]) => ({
              engine,
              category: verdict.category,
              confidence: verdict.confidence,
              sandboxName: verdict.sandbox_name,
            })
          )
        : undefined,

      // ---------- VT Enrichment ----------
      threatSeverity: a.threat_severity
        ? {
            level: a.threat_severity.threat_severity_level,
            description: a.threat_severity.level_description,
            indicators: a.threat_severity.threat_severity_data,
          }
        : undefined,

      tags: a.tags,
      typeTags: a.type_tags,
      knownNames: a.names,
    },
  };
}


    // ================= ANALYSIS CONTEXT =================
    if (result.type === 'analysis') {
      const analysis = result as AnalysisObject;
      const s = analysis.attributes.stats || {};

      const malicious = s.malicious || 0;
      const suspicious = s.suspicious || 0;
      const harmless = s.harmless || 0;
      const undetected = s.undetected || 0;
      const unsupported = s['type-unsupported'] || 0;
      const failures = s.failure || 0;

      const total =
        malicious + suspicious + harmless + undetected + unsupported;

      const threatPercentage = total > 0? Math.round(((malicious + suspicious) / malicious + suspicious + harmless) * 100): 0;

      const threatLevel =
        malicious > 0 ? 'danger' : suspicious > 0 ? 'warning' : 'safe';

      return {
        raw: result,
        filename,
        isFile: false,
        isAnalysis: true,

        analysis: {
          identity: {
            id: analysis.id,
            filename,
          },

          status: {
            state: analysis.attributes.status,
            scanDate: analysis.attributes.date,
          },

          detections: {
            engines: {
              malicious,
              suspicious,
              harmless,
              undetected,
              unsupported,
              failures,
              total,
            },
            threatPercentage,
            threatLevel,
          },

          flaggedEngines: Object.entries(
            analysis.attributes.results || {}
          )
            .filter(
              ([_, r]) =>
                r.category === 'malicious' ||
                r.category === 'suspicious'
            )
            .map(([engine, r]) => ({
              engine,
              category: r.category as 'malicious' | 'suspicious',
              method: r.method,
              result: r.result ?? null,
            })),

          timeouts: {
            timeout: s.timeout,
            confirmedTimeout: s['confirmed-timeout'],
          },
        },
      };
    }

    return {
      raw: result,
      filename,
      isFile: false,
      isAnalysis: false,
    };
  }, [result, filename]);
};
