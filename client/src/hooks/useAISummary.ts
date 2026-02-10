import { useState, useEffect, useRef } from "react";
import { useAISummaryStream } from "./useAISummaryStream";

export function useAISummary() {
  const [open, setOpen] = useState(false);
  const [currentFileUuid, setCurrentFileUuid] = useState<string | null>(null);
  const summariesRef = useRef<Map<string, string>>(new Map());
  const stream = useAISummaryStream();

  // Generate new summary for a file
  const generate = async (fileUuid: string) => {
    setCurrentFileUuid(fileUuid);
    setOpen(true);
    stream.connect(fileUuid);
  };

  // View existing or generate summary for a file (non-blocking)
  const view = async (fileUuid: string) => {
    setCurrentFileUuid(fileUuid);
    setOpen(true);
    
    // If we don't have a cached summary, start streaming
    if (!summariesRef.current.has(fileUuid)) {
      stream.connect(fileUuid);
    }
  };

  // Close modal (doesn't stop generation)
  const close = () => {
    setOpen(false);
  };

  // Store completed summary
  useEffect(() => {
    if (stream.summary && currentFileUuid && !stream.isStreaming) {
      summariesRef.current.set(currentFileUuid, stream.summary);
    }
  }, [stream.summary, stream.isStreaming, currentFileUuid]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stream.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get current summary (from cache or stream)
  const getCurrentSummary = () => {
    if (!currentFileUuid) return null;
    return summariesRef.current.get(currentFileUuid) || stream.summary;
  };

  return {
    summary: getCurrentSummary(),
    status: stream.status,
    loading: stream.isStreaming,
    error: stream.error,
    open,
    currentFileUuid,
    generate,
    view,
    close,
    hasSummary: (uuid: string) => summariesRef.current.has(uuid),
  };
}
