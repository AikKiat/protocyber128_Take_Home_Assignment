import { Box, Typography, Paper } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import FileHistoryCard from './FileHistoryCard';
import type { FileHistoryItem } from '../../types';

interface FileHistoryListProps {
  history: FileHistoryItem[];
  onSelectFile: (uuid: string, filename : string) => void;
  selectedUUID?: string;
}

export default function FileHistoryList({history, onSelectFile, selectedUUID} : FileHistoryListProps){
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Upload History
        </Typography>
      </Box>

      {history.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No files uploaded yet
          </Typography>
        </Paper>
      ) : (
        <Box>
          {history.map((item) => (
            <FileHistoryCard
              key={item.uuid}
              item={item}
              onSelect={onSelectFile}
              isSelected={item.uuid === selectedUUID}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
