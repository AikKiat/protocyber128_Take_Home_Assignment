

from langchain_openai import ChatOpenAI

import os
from dotenv import load_dotenv
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
class Llm:
    def __init__(self):
        return ("This is a singleton. Use get_instance() instead")
    
    _instance = None
    _llm = ChatOpenAI(model="gpt-4o-mini", temperature=1.0, api_key=OPENAI_API_KEY)



    @classmethod
    def get_instance(cls):
        if cls._instance == None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    @property
    def llm(self):
        return self._llm
    
    @llm.setter
    def llm(self, value):
        self._llm = value
    
