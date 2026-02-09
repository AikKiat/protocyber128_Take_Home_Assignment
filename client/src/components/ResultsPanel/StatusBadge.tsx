import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import type { AnalysisStatus } from '../../types';

interface StatusBadgeProps {
  status: AnalysisStatus;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'medium' } : StatusBadgeProps){
  const config = {
    completed: {
      label: 'COMPLETED',
      color: 'success' as const,
      icon: <CheckCircleIcon />,
    },
    queued: {
      label: 'QUEUED',
      color: 'warning' as const,
      icon: <HourglassEmptyIcon />,
    },
    'in-progress': {
      label: 'IN PROGRESS',
      color: 'info' as const,
      icon: <AutorenewIcon />,
    },
  };

  const { label, color, icon } = config[status];

  return (
    <Chip
      label={label}
      color={color}
      icon={icon}
      size={size}
      sx={{
        fontWeight: 600,
        px: 1,
      }}
    />
  );
};
