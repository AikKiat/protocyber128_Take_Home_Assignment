import React from 'react';
import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { formatFileSize, formatDate } from '../../utils/formatters';
import type { FileContext } from '../../types';

interface FileInfoProps {
  context: FileContext;
}

export const FileInfo: React.FC<FileInfoProps> = ({ context }) => {
  const { fileIdentity, hashes, reputation, tags } = context;

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <InsertDriveFileIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            {fileIdentity.name || 'Unknown File'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fileIdentity.type || 'Unknown Type'} •{' '}
            {formatFileSize(fileIdentity.size_bytes)}
            {fileIdentity.extension && ` • ${fileIdentity.extension}`}
          </Typography>
        </Box>
        {reputation?.score !== undefined && (
          <Chip
            label={`Reputation: ${reputation.score}`}
            color={reputation.score > 0 ? 'success' : reputation.score < 0 ? 'error' : 'default'}
            variant="outlined"
          />
        )}
      </Box>

      {hashes && (hashes.md5 || hashes.sha256) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            File Hashes
          </Typography>
          {hashes.md5 && (
            <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
              MD5: {hashes.md5}
            </Typography>
          )}
          {hashes.sha256 && (
            <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
              SHA-256: {hashes.sha256}
            </Typography>
          )}
        </Box>
      )}

      {tags && tags.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Tags
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {tags.slice(0, 10).map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};
