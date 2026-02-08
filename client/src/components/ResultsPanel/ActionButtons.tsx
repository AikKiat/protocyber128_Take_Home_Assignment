import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import type { UploadMode } from '../../types';

interface ActionButtonsProps {
  currentMode : UploadMode;
  onRefresh: () => void;
  onAISummary: () => void;
  refreshing: boolean;
  canShowAISummary: boolean;
  loadingAI: boolean;
}

export default function ActionButtons({currentMode, onRefresh, onAISummary, refreshing, canShowAISummary, loadingAI} : ActionButtonsProps){
  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      {currentMode === 'full' &&
      <Button
        variant="outlined"
        startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        onClick={onRefresh}
        disabled={refreshing}
        fullWidth
      >
        {refreshing ? 'Refreshing...' : 'Refresh Analysis'}
      </Button>}

      <Button
        variant="contained"
        startIcon={loadingAI ? <CircularProgress size={20} color="inherit" /> : <SmartToyIcon />}
        onClick={onAISummary}
        disabled={!canShowAISummary || loadingAI}
        fullWidth
      >
        {loadingAI ? 'Generating...' : 'Get AI Summary'}
      </Button>
    </Box>
  );
};
