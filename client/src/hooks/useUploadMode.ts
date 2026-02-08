import { useState } from "react";
import type { UploadMode, ModeSelectionResult } from "../types";
import { changeUploadMode } from "../api/files_api";

export function useUploadMode() {
  const [uploadMode, setUploadMode] = useState<UploadMode>("quick");

  const toggleUploadMode = async (
    mode: UploadMode,
  ): Promise<ModeSelectionResult | null> => {
    setUploadMode(mode);
    const response = await changeUploadMode(mode);
    return response ?? null;
  };

  return {
    uploadMode,
    toggleUploadMode,
  };
}
