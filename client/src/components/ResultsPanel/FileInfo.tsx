import {
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  Box,
  Tooltip,
} from '@mui/material';
import type { FileContext } from '../../types';

interface FileInfoProps {
  file: FileContext;
}

export default function FileInfo({ file }: FileInfoProps) {
  const {
    identity,
    hashes,
    reputation,
    detections,
    timeline,
    sandboxVerdicts,
    tags,
  } = file;

  const threatColor =
    detections.threatLevel === 'danger'
      ? 'error'
      : detections.threatLevel === 'warning'
      ? 'warning'
      : 'success';

  return (
    <Paper sx={{ p: 3 }}>
      {/* ================= HEADER ================= */}
      <Typography variant="h5" fontWeight={700}>
        {identity.filename}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {identity.typeDescription} ·{' '}
        {identity.sizeBytes
          ? `${(identity.sizeBytes / 1024).toFixed(1)} KB`
          : 'Unknown size'}
      </Typography>

      <Chip
        label={`${detections.threatPercentage}% engines flagged this file`}
        color={threatColor}
        sx={{ mt: 1 }}
      />

      <Divider sx={{ my: 3 }} />
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        These metrics detect how many engines have classified this file into the categories below. 
        Since this is a quick hash-based search, no engines were ran and the results are all undetected. 
        Refer to community scores for the real severity judgement.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label={`Malicious: ${detections.engines.malicious}`} color="error" />
        <Chip
          label={`Suspicious: ${detections.engines.suspicious}`}
          color="warning"
        />
        <Chip
          label={`Harmless: ${detections.engines.harmless}`}
          color="success"
        />
        <Chip
          label={`Undetected: ${detections.engines.undetected}`}
        />
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* ================= SANDBOX ANALYSIS ================= */}
      <Typography variant="h6">Sandbox Analysis</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Sandbox verdicts come from executing the file in isolated virtual
        environments and observing real behavior such as network activity,
        file system changes, or process injection.
      </Typography>

      {sandboxVerdicts && sandboxVerdicts.length > 0 ? (
        <Stack spacing={1}>
          {sandboxVerdicts.map((s) => (
            <Tooltip
              key={s.engine}
              title={`Sandbox: ${s.engine|| 'Unknown'} · Confidence: ${
                s.category ?? 'N/A'
              }`}
            >
              <Chip
                label={`${s.engine}: ${s.category}`}
                color={
                  s.category === 'malicious'
                    ? 'error'
                    : s.category === 'suspicious'
                    ? 'warning'
                    : 'default'
                }
                variant="outlined"
              />
            </Tooltip>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No sandbox execution data is available for this file.
        </Typography>
      )}

      <Divider sx={{ my: 3 }} />

      {/* ================= HASHES ================= */}
      <Typography variant="h6">File Hashes</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Cryptographic hashes uniquely identify this file. They are commonly used
        for threat intelligence correlation and detection rules.
      </Typography>

      <Box sx={{ fontFamily: 'monospace', fontSize: 13 }}>
        {hashes.md5 && <div>MD5: {hashes.md5}</div>}
        {hashes.sha1 && <div>SHA-1: {hashes.sha1}</div>}
        {hashes.sha256 && <div>SHA-256: {hashes.sha256}</div>}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* ================= REPUTATION ================= */}
      <Typography variant="h6">Community Reputation</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Community reputation reflects how VirusTotal users have voted on this
        file, independent of automated engine detections.
      </Typography>

      <Stack direction="row" spacing={1}>
        <Chip
          label={`Reputation score: ${reputation.score}`}
          variant="outlined"
        />
        {reputation.communityVotes && (
          <>
            <Chip
              label={`👍 ${reputation.communityVotes.harmless}`}
              color="success"
            />
            <Chip
              label={`🚩 ${reputation.communityVotes.malicious}`}
              color="error"
            />
          </>
        )}
      </Stack>

      {/* ================= TAGS ================= */}
      {tags && tags.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6">Classification Tags</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Tags help classify the file based on format, behavior, or known
            malware families.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {tags.map((t) => (
              <Chip key={t} label={t} size="small" />
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
}
