

from typing_extensions import Dict
from repository.file_uploads_record import (
    get_current_upload_result,
    retrieve_saved_ai_summary,
    store_ai_summary,
    set_current_file_uuid
)
from ai.ai_response_model import AiResponseModel
from utils.streaming_queue import StreamingQueue
from fastapi.responses import StreamingResponse
from ai.ai_call import run_ai
import asyncio


async def start_ai_summary_background(file_uuid: str):
    """
    Background task to run AI summary generation with streaming using LangGraph workflow.
    Emits status updates and final summary to AiResponseModel which forwards to SSE.
    """
    try:
        current_upload_result : str = get_current_upload_result()
        
        # Run AI using LangGraph workflow (calls result_parser_async internally)
        output = await run_ai(current_upload_result)
        summary = output["summarised_result"]
        
        # Store in cache (Redis + FileUploadsRecord)
        store_ai_summary(file_uuid, summary)
        
        # Emit done signal
        await AiResponseModel.emit_done()
        
    except Exception as e:
        # Emit error to stream
        await AiResponseModel.emit_error(f"Failed to generate summary: {str(e)}")
        raise


async def stream_cached_summary(cached_summary: str):
    """
    Stream a cached summary as SSE events (immediate delivery).
    Ensures frontend EventSource receives proper SSE format even for cached results.
    """
    import json
    
    # Emit summary event
    summary_event = {
        "type": "summary",
        "content": cached_summary
    }
    yield f"data: {json.dumps(summary_event)}\n\n"
    
    # Small delay for event delivery
    await asyncio.sleep(0.01)
    
    # Emit done event
    done_event = {"type": "done"}
    yield f"data: {json.dumps(done_event)}\n\n"


async def stream_ai_response(file_uuid: str):
    """
    Generator function for SSE streaming.
    Initializes queue, starts AI generation in background, and yields SSE events.
    """
    # Initialize the streaming queue
    streaming_queue = StreamingQueue.get_instance()
    streaming_queue.initialise_streaming_queue()
    streaming_queue.get_instance().queue_size = 5
    
    AiResponseModel.set_sse_queue(streaming_queue.queue)
    
    try:
        # Start AI generation in background (non-blocking)
        asyncio.create_task(start_ai_summary_background(file_uuid))
        
        # Stream responses to client
        async for event in streaming_queue.stream_responses_while_available():
            yield event
            
    finally:
        # Cleanup
        AiResponseModel.set_sse_queue(None)

async def ai_summarise(file_uuid: str):
    """
    Generate AI summary for a file scan result.
    Checks Redis cache first, returns cached summary via SSE if available.
    Otherwise streams generation progress via SSE.
    
    Always returns SSE format for consistent frontend EventSource handling.
    """
    # Set current file UUID
    set_current_file_uuid(file_uuid)

    # Check cache first (similar to vt_scan_files pattern)
    cached_summary = retrieve_saved_ai_summary(file_uuid)
    if cached_summary:
        print(f"[AI_SUMMARISE_SERVICE] Cache hit for file_uuid: {file_uuid}. Streaming cached result...")
        # Return cached summary as SSE events (not plain string)
        return StreamingResponse(
            stream_cached_summary(cached_summary),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )

    print(f"[AI_SUMMARISE_SERVICE] Cache miss for file_uuid: {file_uuid}. Generating new summary...")
    
    # If not cached, stream the generation with status updates
    return StreamingResponse(
        stream_ai_response(file_uuid),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable buffering in nginx
        }
    )





