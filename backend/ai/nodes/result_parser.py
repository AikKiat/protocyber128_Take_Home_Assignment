

from langchain_core.messages import HumanMessage, SystemMessage

from ai.state import State
from ai.prompts import Prompts
from ai.llm import Llm

def result_parser(state : State):
    llm = Llm.get_instance().llm
    human_message = state["raw_result"]

    system_message = Prompts.RESULT_SUMMARISER_PROMPT.value

    response = llm.invoke([HumanMessage(content=human_message), SystemMessage(content=system_message)])

    content = response.content

    return {"summarised_result" : content}

    