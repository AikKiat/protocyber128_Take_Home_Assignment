import React, { useCallback, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { UploadMode } from '../../types';

interface FileDropzoneProps {
  onFileSelect: (file: File) => Promise<void>;
  mode: UploadMode;
  loading: boolean;
}

export default function FileDropzone({ onFileSelect, mode, loading } : FileDropzoneProps){
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await onFileSelect(files[0]);
      }
      // Reset input value over here to allow re-uploading of files
      e.target.value = '';
    },
    [onFileSelect]
  );

  return (
    <Paper
      elevation={isDragging ? 8 : 2}
      sx={{
        p: 4,
        textAlign: 'center',
        border: isDragging ? '2px dashed' : '2px dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: loading ? 'divider' : 'primary.main',
          bgcolor: loading ? 'background.paper' : 'action.hover',
        },
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !loading && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        hidden
        onChange={handleFileInputChange}
        disabled={loading}
      />

      {loading ? (
        <Box>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Uploading and analyzing...
          </Typography>
        </Box>
      ) : (
        <Box>
          <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {mode === 'quick' ? 'Quick Scan' : 'Full Scan'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag & drop your file here, or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {mode === 'quick'
              ? 'Hash-based lookup - Instant results for known files'
              : 'Complete analysis - May take a few moments'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
