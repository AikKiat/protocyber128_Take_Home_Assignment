import { useState } from "react";
import {
  uploadQuick,
  uploadFull,
  getCurrentAnalysis,
} from "../api/virustotal.api";

import type {
  UploadMode,
  FileResponse,
  AnalysisObject,
  FileObject,
  APIResponse,
} from "../types";

export function useUpload(uploadMode: UploadMode) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      if (uploadMode === "quick") {
        const response: APIResponse<FileResponse> = await uploadQuick(file);
        return {
          uuid: response.result.uuid,
          filename: response.result.filename,
          result: response.result.result as FileObject,
        };
      }

      const response = await uploadFull(file);
      const body = response.result;

      if (body.found && body.result) {
        return {
          uuid: body.uuid,
          filename: body.filename,
          result: body.result as AnalysisObject,
        };
      }

      const analysis = await getCurrentAnalysis(body.uuid);
      return {
        uuid: body.uuid,
        filename: body.filename,
        result: analysis.result as AnalysisObject,
      };
    } catch (err: any) {
      setError(
        err.response?.data?.detail ??
          "Failed to upload file. Please try again.",
      );
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    error,
  };
}
