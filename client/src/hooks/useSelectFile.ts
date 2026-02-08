import { useCallback, useState } from "react";
import { selectFile } from "../api/files_api";
import type { AnalysisObject, FileObject, SavedFileResultsResponse, UploadMode } from "../types";

export function useSelectFile() {
  const [selectedResult, setSelectedResult] = useState<FileObject | AnalysisObject | null>(null);
  const [selectedUUID, setSelectedUUID] = useState<string | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle file selection from history
  const selectFileByUUID = useCallback(async (uuid: string, filename : string) => {
    setError(null);
    setLoading(true);
    setSelectedUUID(uuid);
    setSelectedFilename(filename);

    try {
      const response: SavedFileResultsResponse = await selectFile(uuid);

      if (!response.result) {
        const errorMsg = 'No result returned for this file. Please try again.';
        setError(errorMsg);
        return { error: errorMsg };
      }

      const mode: UploadMode = response.result.type === 'analysis' ? 'full' : 'quick';
      setSelectedResult(response.result);
      return { result: response.result, mode };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load file data. Please try again.';
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedResult(null);
    setSelectedUUID(null);
    setError(null);
  }, []);

  return {
    selectedResult,
    selectedUUID,
    selectedFilename,
    loading,
    error,
    selectFileByUUID,
    clearSelection,
  };
}