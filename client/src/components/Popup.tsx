import{ Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material';

interface PopupProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

export default function Popup({open,message,severity = 'info',onClose,autoHideDuration = 6000}: PopupProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }} variant="filled">
        {message}
        </Alert>
    </Snackbar>
  );
}
