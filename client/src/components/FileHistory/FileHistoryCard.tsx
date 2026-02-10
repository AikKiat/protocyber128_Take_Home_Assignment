import { Paper, Box, Typography, Button, Chip, IconButton, Tooltip } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import type { FileHistoryItem } from '../../types';
import { formatDate } from '../../utils/formatters';

interface FileHistoryCardProps {
  item: FileHistoryItem;
  onSelect: (uuid: string, filename : string) => void;
  onViewAISummary?: (uuid: string) => void;
  isSelected?: boolean;
}

export default function FileHistoryCard({item, onSelect, onViewAISummary, isSelected = false} : FileHistoryCardProps){
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
          <Typography variant="body1" fontWeight={400} gutterBottom>
            {item.scanMode.toUpperCase()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip label={item.fileType} size="small" color="primary" variant="outlined" />
            <Typography variant="caption" color="text.secondary">
              {formatDate(item.timestamp)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {onViewAISummary && (
            <Tooltip title="View AI Summary">
              <IconButton
                color="secondary"
                onClick={() => onViewAISummary(item.uuid)}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <SmartToyIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Button
            variant={isSelected ? 'contained' : 'outlined'}
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => onSelect(item.uuid, item.filename)}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
