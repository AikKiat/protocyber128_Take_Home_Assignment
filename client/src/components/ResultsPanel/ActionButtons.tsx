import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface ActionButtonsProps {
  onRefresh: () => void;
  onAISummary: () => void;
  refreshing: boolean;
  canShowAISummary: boolean;
  loadingAI: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRefresh,
  onAISummary,
  refreshing,
  canShowAISummary,
  loadingAI,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      <Button
        variant="outlined"
        startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        onClick={onRefresh}
        disabled={refreshing}
        fullWidth
      >
        {refreshing ? 'Refreshing...' : 'Refresh Analysis'}
      </Button>

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
