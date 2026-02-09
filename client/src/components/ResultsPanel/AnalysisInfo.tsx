import { useMemo, useState } from 'react';
import {Paper,Box,Typography,Chip,Stack,Grid,IconButton,Collapse,Divider} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { AnalysisContext } from '../../types';

interface AnalysisInfoProps {
  analysis: AnalysisContext;
}

export default function AnalysisInfo({ analysis }: AnalysisInfoProps) {
  const [expanded, setExpanded] = useState(false);

  const { identity, status, detections, flaggedEngines, timeouts } = analysis;

  const threatColor = () => {
    switch(detections.threatLevel){
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      default :
        return 'success';
    }
  };

  const threatLabel = () =>{
    switch(detections.threatLevel){
      case 'danger':
        return 'MALICIOUS SIGNATURE DETECTED';
      case 'warning':
        return 'SUSPICIOUS ACTIVITY';
      default :
        return 'NO THREATS DETECTED';
    }
  }

  const engineSummaryChips = useMemo(
    () => [
      {
        label: 'Total Engines',
        value: detections.engines.total,
        color: 'primary' as const,
        variant: 'filled' as const,
      },
      {
        label: 'Malicious flags',
        value: detections.engines.malicious,
        color: 'error' as const,
        variant: 'outlined' as const,
      },
      {
        label: 'Suspicious flags',
        value: detections.engines.suspicious,
        color: 'warning' as const,
        variant: 'outlined' as const,
      },
      {
        label: 'Harmless verdicts',
        value: detections.engines.harmless,
        color: 'success' as const,
        variant: 'outlined' as const,
      },
      {
        label: 'Undetected',
        value: detections.engines.undetected,
        color: 'info' as const,
        variant: 'outlined' as const,
      },
      {
        label: 'Unsupported',
        value: detections.engines.unsupported,
        color: 'default' as const,
        variant: 'outlined' as const,
      },
      {
        label: 'Failures',
        value: detections.engines.failures,
        color: 'secondary' as const,
        variant: 'outlined' as const,
      },
    ],
    [detections.engines]
  );

  const engineStatCards = useMemo(
    () => [
      { key: 'malicious', label: 'Malicious', value: detections.engines.malicious, color: '#f44336' },
      { key: 'suspicious', label: 'Suspicious', value: detections.engines.suspicious, color: '#ffa000' },
      { key: 'harmless', label: 'Harmless', value: detections.engines.harmless, color: '#66bb6a' },
      { key: 'undetected', label: 'Undetected', value: detections.engines.undetected, color: '#42a5f5' },
      { key: 'unsupported', label: 'Unsupported', value: detections.engines.unsupported, color: '#9e9e9e' },
      { key: 'failures', label: 'Failures', value: detections.engines.failures, color: '#7e57c2' },
    ],
    [detections.engines]
  );

  return (
    <Paper
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, rgba(25,118,210,0.06), rgba(0,0,0,0))',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 2,
      }}
    >
      {/* Header */}
      <Box display="flex" gap={2} mb={2}>
        <AssessmentIcon color="primary" sx={{ fontSize: 48 }} />
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>
            Analysis Report
            <Chip
              label={threatLabel()}
              color={threatColor()}
              sx={{ ml: 2, fontWeight: 600 }}
            />
          </Typography>

          <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
            <Chip
              label={identity.filename || 'Unknown file'}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`Analysis ID: ${identity.id}`}
              variant="outlined"
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            <Chip
              icon={<SecurityIcon />}
              label={`Threat Score: ${detections.threatPercentage}%`}
              color={threatColor()}
              size="small"
            />
            <Chip
              label={`Status: ${status.state}`}
              color={
                status.state === 'completed'
                  ? 'success'
                : status.state === 'queued'
                  ? 'warning'
                  : 'info'
              }
              size="small"
            />
            {engineSummaryChips.map((chip) => (
              <Chip
                key={chip.label}
                label={`${chip.label}: ${chip.value}`}
                color={chip.color}
                variant={chip.variant}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Scan Info */}
      <Box mb={2} p={2} bgcolor="background.default" borderRadius={1}>
        <Typography variant="subtitle2" fontWeight={600}>
          📅 Scan Information
        </Typography>
        <Typography variant="body2">
          {new Date(status.scanDate * 1000).toLocaleString()}
        </Typography>
      </Box>

      {/* Detection Stats */}
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        📊 Detection Statistics
      </Typography>

      <Grid container spacing={1.5}>
        {engineStatCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.key}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${card.color}1A, rgba(0,0,0,0))`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {card.label}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Expandable Details */}
      <Box mt={2}>
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          <Typography variant="body2" ml={1}>
            {expanded ? 'Hide' : 'Show'} Detailed Engine Results
          </Typography>
        </IconButton>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />

          {flaggedEngines.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No engines flagged this file.
            </Typography>
          ) : (
            flaggedEngines.map((e) => (
              <Paper
                key={e.engine}
                variant="outlined"
                sx={{ p: 1.5, mb: 1 }}
              >
                <Typography fontWeight={600}>
                  {e.engine}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {e.category.toUpperCase()} — {e.method || 'unknown method'}
                </Typography>
                {e.result && (
                  <Typography variant="body2" mt={0.5}>
                    {e.result}
                  </Typography>
                )}
              </Paper>
            ))
          )}

          {timeouts && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600}>
                ⏱ Timeouts
              </Typography>
              {timeouts.timeout && (
                <Chip
                  label={`Timeouts: ${timeouts.timeout}`}
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              {timeouts.confirmedTimeout && (
                <Chip
                  label={`Confirmed Timeouts: ${timeouts.confirmedTimeout}`}
                  size="small"
                />
              )}
            </>
          )}
        </Collapse>
      </Box>
    </Paper>
  );
}
