

from langchain_core.messages import HumanMessage, SystemMessage

from repository.file_uploads_record import get_current_file_uuid, get_filename_for_uuid


from ai.state import State
from ai.prompts import Prompts, ReferenceData
from ai.llm import Llm
from ai.ai_response_model import AiResponseModel
import json
import asyncio

async def result_parser(state : State):
    llm = Llm.get_instance().llm
    vt_scan_results : str = state["raw_result"]

    filename = get_filename_for_uuid(get_current_file_uuid())
    print(filename)

    human_message : dict = {
        "filename" : filename,
        "vt_scan_results" : vt_scan_results,
        "Reference for file objects" : ReferenceData.FILE_OBJECT_KEYWORD_EXPLANATIONS.value,
        "Reference for Analysis objects" : ReferenceData.ANALYSIS_OBJECT_KEYWORD_EXPLANATIONS.value
    }

    system_message = Prompts.RESULT_SUMMARISER_PROMPT.value

    AiResponseModel.reset_state()
    
    AiResponseModel.set_status("Receiving input...")
    await asyncio.sleep(1)

    AiResponseModel.set_status("Analysing scan results...")

    response = await llm.ainvoke([
        HumanMessage(content=json.dumps(human_message)), 
        SystemMessage(content=system_message)
    ])
    
    content = response.content
    
    # Send status update
    AiResponseModel.set_status("Formatting summary...")
    await asyncio.sleep(1)
    
    AiResponseModel.set_summary(content)

    return {"summarised_result" : content}