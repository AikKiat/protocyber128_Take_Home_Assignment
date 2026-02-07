
from langgraph.graph import END, StateGraph
from nodes.result_parser import result_parser
from state import State


def build_ai_call():
    graph = StateGraph(State)
    graph.add_node("result_parser_node", result_parser)
    graph.set_entry_point("result_parser_node")
    graph.add_edge("result_parser_node", END)

    return graph.compile()

def run_ai_call(raw_result : str):
    initial_state : State = {
        "raw_result" : raw_result,
        "summarised_result" : ""
    }

    ai_call = build_ai_call()

    output = ai_call.invoke(initial_state)
    return output



