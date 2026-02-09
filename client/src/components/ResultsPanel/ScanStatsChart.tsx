import { 
  Box, Typography, Paper, Grid2, LinearProgress, Chip, 
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { AnalysisStats, EngineResult } from '../../types';

interface ScanStatsChartProps {
  stats: AnalysisStats;
  threatLevel: 'safe' | 'warning' | 'danger';
  engineResults?: Record<string, EngineResult>;
}

const COLORS = {
  malicious: '#f44336', // Red
  suspicious: '#ff9800', // Orange
  harmless: '#4caf50', // Green
  undetected: '#9e9e9e', // Grey
  unsupported: '#282828', // Dark Grey
  failure: '#e91e63', // Pink
  timeout: '#9c27b0', // Purple
};

export default function ScanStatsChart({ stats, threatLevel, engineResults } : ScanStatsChartProps){

  // PIE CHART STATS (Flags of Malicious, Suspicious, Undetected and Harmless..)
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const harmless = stats.harmless || 0;
  const undetected = stats.undetected || 0;
  const unsupported = stats['type-unsupported'] || 0;

  const primaryTotal = malicious + suspicious + harmless + undetected + unsupported;



  const threatPercentage = primaryTotal > 0 ? Math.round(((malicious + suspicious) / primaryTotal) * 100) : 0;
  const pieData = [
    { name: 'Malicious', value: malicious, color: COLORS.malicious },
    { name: 'Suspicious', value: suspicious, color: COLORS.suspicious },
    { name: 'Harmless', value: harmless, color: COLORS.harmless },
    { name: 'Undetected', value: undetected, color: COLORS.undetected },
    { name: 'Type-Unsupported', value : unsupported, color : COLORS.unsupported}
  ].filter((item) => item.value > 0);


  // Additional stats
  const additionalStats = [
    { name: 'Type Unsupported', value: stats['type-unsupported'] || 0, color: COLORS.unsupported },
    { name: 'Confirmed Timeout', value: stats['confirmed-timeout'] || 0, color: COLORS.timeout },
    { name: 'Timeout', value: stats.timeout || 0, color: COLORS.timeout },
    { name: 'Failure', value: stats.failure || 0, color: COLORS.failure },
  ].filter((item) => item.value > 0);

  const allStatsTotal = primaryTotal + additionalStats.reduce((sum, s) => sum + s.value, 0);

  const uiThreatColouring = (threatLevel : string)=>{
    switch (threatLevel) {
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      case 'safe':
      default:
        return 'success';
    }
  }

  const uiEngineVerdictColouring = (engineVerdict : EngineResult)=>{
    switch(engineVerdict.category){
      case 'malicious':
        return 'error';
      case 'suspicious':
        return 'warning';
      default:
        return 'success';
    }
  }


  return (
    <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 Security Scan Results
      </Typography>

      {primaryTotal === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No scan results available
        </Typography>
      ) : (
        <>
          <Grid2 container spacing={3}>
            {/* Pie Chart Element*/}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Grid2>

            {/* Show all Engine results*/}
            {engineResults && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                🧠 Engine Verdicts
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Engine</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Engine Version</TableCell>
                      <TableCell>Engine Update Ver</TableCell>
                      <TableCell>Method</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(engineResults).map(([engine, verdict]: any) => {
                      let engineVerdict : EngineResult = verdict;
                      let analysisEngineName : string = engine;

                      return(
                      <TableRow key={analysisEngineName}>
                        <TableCell>{analysisEngineName}</TableCell>
                        <TableCell>
                          <Chip
                            label={engineVerdict.category}
                            size="small"
                            color={uiEngineVerdictColouring(engineVerdict)}
                          />
                        </TableCell>
                        <TableCell>{engineVerdict.result || '—'}</TableCell>
                        <TableCell>{engineVerdict.engine_version || '—'}</TableCell>
                        <TableCell>{engineVerdict.engine_update || '_'}</TableCell>
                        <TableCell>{engineVerdict.method || '—'}</TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            )}


            {/* Stats Summary */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Box>
                {/* Threat Level Indicator */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Threat Level
                    </Typography>
                    <Chip
                      label={threatLevel.toUpperCase()}
                      color={uiThreatColouring(threatLevel)}
                      size="small"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={threatPercentage}
                    color={uiThreatColouring(threatLevel)}
                    sx={{ height: 12, borderRadius: 6 }}
                  />
                </Box>

                {/* Quick Summary Chips */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={`Total: ${allStatsTotal} engines`}
                    color="primary"
                    size="small"
                  />
                  {malicious > 0 && (
                    <Chip
                      label={`⚠️ ${malicious} flagged`}
                      color="error"
                      size="small"
                    />
                  )}
                </Stack>
              </Box>
            </Grid2>
          </Grid2>

          {/* Detailed Stats Breakdown */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              📋 Detailed Breakdown
            </Typography>
            <Grid2 container spacing={2}>
              {pieData.map((item) => (
                <Grid2 key={item.name} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderLeft: `4px solid ${item.color}`,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.name}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid2>
              ))}
              {additionalStats.map((item) => (
                <Grid2 key={item.name} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderLeft: `4px solid ${item.color}`,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.name}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid2>
              ))}
            </Grid2>
          </Box>
        </>
      )}
    </Paper>
  );
};
