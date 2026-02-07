import { apiClient } from './client';
import type { ScanResult } from '../types';

/**
 * Select a file by UUID to get cached results
 */
export const selectFile = async (uuid: string): Promise<ScanResult> => {
  const response = await apiClient.post('/files/select', { uuid });
  return response.data;
};
