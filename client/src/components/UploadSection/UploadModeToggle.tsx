import React from 'react';
import { ToggleButtonGroup, ToggleButton, Box, Typography } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SearchIcon from '@mui/icons-material/Search';
import type { UploadMode } from '../../types';

interface UploadModeToggleProps {
  mode: UploadMode;
  onChange: (mode: UploadMode) => void;
}

export const UploadModeToggle: React.FC<UploadModeToggleProps> = ({ mode, onChange }) => {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newMode: UploadMode | null) => {
    if (newMode !== null) {
      onChange(newMode);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        Upload Mode
      </Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleChange}
        aria-label="upload mode"
        fullWidth
        color="primary"
      >
        <ToggleButton value="quick" aria-label="quick scan">
          <FlashOnIcon sx={{ mr: 1 }} />
          Quick Scan (Hash)
        </ToggleButton>
        <ToggleButton value="full" aria-label="full scan">
          <SearchIcon sx={{ mr: 1 }} />
          Full Scan
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
