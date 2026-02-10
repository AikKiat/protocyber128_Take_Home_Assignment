
from langgraph.graph import END, StateGraph
from ai.nodes.result_parser import result_parser
from ai.state import State


def build_ai_call():
    """Build LangGraph workflow using async result parser for SSE streaming."""
    graph = StateGraph(State)
    graph.add_node("result_parser_node", result_parser)
    graph.set_entry_point("result_parser_node")
    graph.add_edge("result_parser_node", END)

    return graph.compile()

async def run_ai(raw_result : str):
    """Run AI workflow asynchronously using LangGraph with SSE streaming support."""
    initial_state : State = {
        "raw_result" : raw_result,
        "summarised_result" : ""
    }

    ai_call = build_ai_call()

    output = await ai_call.ainvoke(initial_state)
    return output



