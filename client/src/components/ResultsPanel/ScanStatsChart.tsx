import React from 'react';
import { Box, Typography, Paper, Grid2, LinearProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { AnalysisStats } from '../../types';
import { getTotalScanCount, getThreatPercentage } from '../../utils/contextExtractor';

interface ScanStatsChartProps {
  stats: AnalysisStats;
}

const COLORS = {
  malicious: '#f44336', // Red
  suspicious: '#ff9800', // Orange
  harmless: '#4caf50', // Green
  undetected: '#9e9e9e', // Grey
  unsupported: '#757575', // Dark grey
  failure: '#e91e63', // Pink
};

export const ScanStatsChart: React.FC<ScanStatsChartProps> = ({ stats }) => {
  const total = getTotalScanCount(stats);
  const threatPercentage = getThreatPercentage(stats);

  const data = [
    { name: 'Malicious', value: stats.malicious || 0, color: COLORS.malicious },
    { name: 'Suspicious', value: stats.suspicious || 0, color: COLORS.suspicious },
    { name: 'Harmless', value: stats.harmless || 0, color: COLORS.harmless },
    { name: 'Undetected', value: stats.undetected || 0, color: COLORS.undetected },
  ].filter((item) => item.value > 0);

  const additionalStats = [
    { name: 'Type Unsupported', value: stats['type-unsupported'] || 0 },
    { name: 'Failures', value: stats.failure || 0 },
    { name: 'Timeouts', value: stats.timeout || 0 },
  ].filter((item) => item.value > 0);

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Scan Results
      </Typography>

      {total === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No scan results available
        </Typography>
      ) : (
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <Box>
              {/* Threat Level */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Threat Level: {threatPercentage}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={threatPercentage}
                  color={threatPercentage > 10 ? 'error' : threatPercentage > 0 ? 'warning' : 'success'}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>

              {/* Stats Breakdown */}
              <Box>
                {data.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      <span style={{ color: item.color, fontWeight: 600 }}>●</span> {item.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}

                {additionalStats.length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Additional Info
                    </Typography>
                    {additionalStats.map((item) => (
                      <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {item.name}
                        </Typography>
                        <Typography variant="caption">{item.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid2>
        </Grid2>
      )}
    </Paper>
  );
};
