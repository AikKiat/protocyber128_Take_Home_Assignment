import { apiClient } from './client';
import type { SavedFileResultsResponse} from '../types';

/**
 * Select a file by UUID to get cached results
 */
export const selectFile = async (uuid: string): Promise<SavedFileResultsResponse> => {
  const response = await apiClient.post('/files/select', {"uuid" : uuid });
  return response.data;
};
