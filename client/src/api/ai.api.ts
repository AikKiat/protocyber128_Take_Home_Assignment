import { apiClient } from './client';
import type { AISummaryResponse } from '../types';

/**
 * Get AI summary for current file
 */
export const getAISummary = async (): Promise<AISummaryResponse> => {
  const response = await apiClient.post<AISummaryResponse>('/ai/summarise');
  return response.data;
};
