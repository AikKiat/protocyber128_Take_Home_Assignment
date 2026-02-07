import React from 'react';
import { Paper, Box, Typography, Button, Chip } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatFileSize, formatDate } from '../../utils/formatters';
import type { FileHistoryItem } from '../../types';

interface FileHistoryCardProps {
  item: FileHistoryItem;
  onSelect: (uuid: string) => void;
  isSelected?: boolean;
}

export const FileHistoryCard: React.FC<FileHistoryCardProps> = ({
  item,
  onSelect,
  isSelected = false,
}) => {
  return (
    <Paper
      elevation={isSelected ? 4 : 1}
      sx={{
        p: 2,
        mb: 2,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          elevation: 3,
          borderColor: 'primary.light',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <InsertDriveFileIcon sx={{ fontSize: 32, color: 'primary.main' }} />

        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight={600} gutterBottom>
            {item.filename}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip label={item.fileType} size="small" color="primary" variant="outlined" />
            <Chip label={item.scanMode === 'quick' ? 'Quick Scan' : 'Full Scan'} size="small" variant="outlined" />
            <Typography variant="caption" color="text.secondary">
              {formatDate(item.timestamp)}
            </Typography>
          </Box>
        </Box>

        <Button
          variant={isSelected ? 'contained' : 'outlined'}
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => onSelect(item.uuid)}
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </Box>
    </Paper>
  );
};
