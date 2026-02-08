import { apiClient } from './client';
import type { SavedFileResultsResponse, UploadMode, ModeSelectionResult} from '../types';

/**
 * Select a file by UUID to get cached results
 */
export const selectFile = async (uuid: string): Promise<SavedFileResultsResponse> => {
  const response = await apiClient.post('/files/select', {"uuid" : uuid });
  return response.data;
};

export const changeUploadMode = async(mode : UploadMode, needFetch : boolean) : Promise<ModeSelectionResult> =>{
  const response = await apiClient.post('/files/toggle-upload', {"mode" : mode, "need_fetch" : needFetch});
  return response.data;
}
