import { apiClient } from './client';
import type { APIResponse,FileResponse, AnalysisResponse, AnalysisObject } from '../types';

/**
 * Upload file for quick scan (hash-based lookup)
 */
export const uploadQuick = async (file: File): Promise<APIResponse<FileResponse>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<APIResponse<FileResponse>>(
        '/vt/upload-quick',
        formData,
        {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        }
    );

    return response.data;
    };

/**
 * Upload file for full scan
 */
export const uploadFull = async (file: File, password?: string): Promise<APIResponse<AnalysisResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
        formData.append('password', password);
    }

    const response = await apiClient.post<APIResponse<AnalysisResponse>>(
        '/vt/upload-complete',
        formData,
        {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        }
    );

    return response.data;
    };

/**
 * Get current analysis status by filename
 */
export const getCurrentAnalysis = async (fileUuid: string): Promise<APIResponse<AnalysisObject>> => {
    const response = await apiClient.get<APIResponse<AnalysisObject>>(
        `/vt/current-analysis/${encodeURIComponent(fileUuid)}`
    );

    console.log(response.data);
    
    return response.data;
};