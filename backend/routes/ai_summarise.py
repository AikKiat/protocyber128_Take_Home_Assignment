

from fastapi import APIRouter, Query
from services.ai_summarise import ai_summarise

router = APIRouter(prefix="/ai", tags=["AI_Summarise"])


@router.get("/summarise/stream")
async def stream_ai_summary(file_uuid: str = Query(..., description="UUID of the file to generate summary for")):
    """
    Server-Sent Events endpoint for streaming AI summary generation.
    Checks Redis cache first - returns cached summary if available.
    Otherwise sends status updates and complete summary via SSE.
    
    Similar caching pattern to file scan endpoints for consistency.
    """

    result = await ai_summarise(file_uuid)
    print(result)
    return result