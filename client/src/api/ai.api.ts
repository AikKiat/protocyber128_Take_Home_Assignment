import { apiClient } from './client';
import type { AISummaryResponse } from '../types';


//Get the AI summary for the results.
export const getAISummary = async (): Promise<AISummaryResponse> => {
  const response = await apiClient.post<AISummaryResponse>('/ai/summarise');
  return response.data;
};
