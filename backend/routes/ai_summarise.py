

from fastapi import APIRouter, HTTPException, status
from services.ai_summarise import summarise
from typing_extensions import Dict


from ai.ai_call import run_ai_call

router = APIRouter(prefix="/ai", tags=["AI_Summarise"])


@router.post("/summarise")
async def give_a_summary():

    ai_summary = await summarise()
    
    if not ai_summary:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Summary is null. {ValueError}")
    
    return {"status" : status.HTTP_200_OK, "result" : ai_summary}