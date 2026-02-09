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
        const response : APIResponse<FileResponse> = await uploadQuick(file);
        if (response.status == 204){
          return {
            fileNotFound : true,
            message: response.message,
          } as const;
        }
        return {
          fileNotFound : false,
          uuid: response.result.uuid,
          filename: response.result.filename,
          result: response.result.result as FileObject,
        } as const;
      }

      const response = await uploadFull(file);
      const body = response.result;

      //This is only the case if we returned a cache result.
      if (body.found && body.result as AnalysisObject) {
        return {
          fileNotFound: false,
          uuid: body.uuid,
          filename: body.filename,
          result: body.result as AnalysisObject,
        } as const;
      }

      //Else...we need to get the current analysis of this newly uploaded file.

      const analysis = await getCurrentAnalysis(body.uuid);
      return {
        fileNotFound: false,
        uuid: body.uuid,
        filename: body.filename,
        result: analysis.result as AnalysisObject,
      } as const;

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
