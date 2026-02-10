import { useState, useCallback, useRef } from 'react';
import { createAISummaryStream } from '../api/ai.stream';

export function useAISummaryStream() {
  const [summary, setSummary] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback((fileUuid: string) => {
    // Reset state
    setSummary('');
    setStatus('');
    setError(null);
    setIsStreaming(true);

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create SSE connection using the API module
    const eventSource = createAISummaryStream(fileUuid, {
      onStatus: (statusMessage) => {
        setStatus(statusMessage);
      },
      onSummary: (summaryText) => {
        setSummary(summaryText);
        setStatus('');
      },
      onDone: () => {
        setIsStreaming(false);
        setStatus('');
      },
      onError: (errorMessage) => {
        setError(errorMessage);
        setIsStreaming(false);
        setStatus('');
      },
    });

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
    };
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setStatus('');
  }, []);

  return {
    summary,
    status,
    isStreaming,
    error,
    connect,
    disconnect,
  };
}
