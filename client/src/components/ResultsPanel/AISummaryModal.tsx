import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FadingText from './FadingText';

interface AISummaryModalProps {
  open: boolean;
  onClose: () => void;
  summary: string | null;
  status?: string;
  loading?: boolean;
}

export default function AISummaryModal({ open, onClose, summary, status, loading = false } : AISummaryModalProps){
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
        <SmartToyIcon sx={{ mr: 1, color: 'primary.main' }} />
        AI Analysis Summary
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && !summary ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              {status || 'Generating AI summary...'}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
              You can close this and check back later
            </Typography>
          </Box>
        ) : summary ? (
          <Box sx={{ fontSize: '1rem', lineHeight: 1.8 }}>
            <FadingText text={summary} delay={15} />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ p: 4 }}>
            No summary available. Click "Generate AI Summary" to create one.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
