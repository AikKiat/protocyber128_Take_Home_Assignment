import { useMemo, useState } from "react";
import { getCurrentAnalysis } from "../api/virustotal.api";
import type { ScanResult, AnalysisObject } from "../types";

export function useAnalysis(
  currentResult: ScanResult | null,
  uuid: string,
) {
  const [refreshing, setRefreshing] = useState(false);

  const isComplete = useMemo(() => {
    if (!currentResult) return false;
    if (currentResult.type === "file") return true;
    if (
      currentResult.type === "analysis" &&
      (currentResult as AnalysisObject).attributes.status === "completed"
    ) {
      return true;
    }
    return false;
  }, [currentResult]);

  const refresh = async () => {
    if (!uuid) return null;
    setRefreshing(true);
    try {
      const response = await getCurrentAnalysis(uuid);
      return response.result;
    } finally {
      setRefreshing(false);
    }
  };

  return {
    isComplete,
    refreshing,
    refresh,
  };
}
