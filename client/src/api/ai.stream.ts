/**
 * Server-Sent Events (SSE) connection for AI summary streaming.
 * This is separate from the main API client since SSE uses EventSource, not Axios.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface StreamEvent {
  type: 'status' | 'summary' | 'done' | 'error';
  content?: string;
}

export interface SSECallbacks {
  onStatus?: (status: string) => void;
  onSummary?: (summary: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

/**
 * Creates an SSE connection to stream AI summary generation.
 * 
 * @param fileUuid - UUID of the file to generate summary for
 * @param callbacks - Callback functions for different event types
 * @returns EventSource instance that can be closed by the caller
 */
export function createAISummaryStream(fileUuid: string, callbacks: SSECallbacks): EventSource {
  const url = `${API_BASE_URL}/ai/summarise/stream?file_uuid=${encodeURIComponent(fileUuid)}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data: StreamEvent = JSON.parse(event.data);
      console.log(data);
      switch (data.type) {
        case 'status':
          if (data.content && callbacks.onStatus) {
            callbacks.onStatus(data.content);
          }
          break;

        case 'summary':
          if (data.content && callbacks.onSummary) {
            callbacks.onSummary(data.content);
          }
          break;

        case 'done':
          if (callbacks.onDone) {
            callbacks.onDone();
          }
          eventSource.close();
          break;

        case 'error':
          if (callbacks.onError) {
            callbacks.onError(data.content || 'An error occurred during generation');
          }
          eventSource.close();
          break;
      }
    } catch (err) {
      console.error('[SSE] Failed to parse event:', err);
      if (callbacks.onError) {
        callbacks.onError('Failed to parse server response');
      }
      eventSource.close();
    }
  };

  eventSource.onerror = (error) => {
    console.error('[SSE] Connection error:', error);
    if (callbacks.onError) {
      callbacks.onError('Connection to server lost');
    }
    eventSource.close();
  };

  console.log(`[SSE] Connected to ${url}`);
  return eventSource;
}
