

import asyncio
from typing import Optional

#This is the Singleton model for managing AI response streaming via SSE."""

class AiResponseModel:
    
    def __init__(self):
        raise RuntimeWarning("This is a singleton. Access it via get_instance instead.")
    
    _instance = None
    _summary_content: str = ""
    _sse_queue: Optional[asyncio.Queue] = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    @classmethod
    def set_status(cls, status: str):
        if isinstance(status, str) and cls._sse_queue:
            try:
                cls._sse_queue.put_nowait({
                    "type": "status",
                    "content": status
                })
            except asyncio.QueueFull:
                print("[AI RESPONSE MODEL] The queue is currently full. Adding on to status later on.")
    
    @classmethod
    def set_summary(cls, summary: str):
        if isinstance(summary, str):
            cls._summary_content = summary
            
            # Emit full summary to SSE stream here.
            if cls._sse_queue:
                try:
                    cls._sse_queue.put_nowait({
                        "type": "summary",
                        "content": summary
                    })
                except asyncio.QueueFull:
                    pass
    
    @classmethod
    def get_summary_content(cls) -> str:
        return cls._summary_content
    
    @classmethod
    def reset_state(cls):
        cls._summary_content = ""
    
    @classmethod
    def set_sse_queue(cls, queue: asyncio.Queue):
        cls._sse_queue = queue
    
    @classmethod
    async def emit_done(cls):
        if cls._sse_queue:
            await cls._sse_queue.put({"type": "done"})
    
    @classmethod
    async def emit_error(cls, error_message: str):
        if cls._sse_queue:
            await cls._sse_queue.put(
                {
                    "type": "error",
                    "content": error_message
                }
            )
