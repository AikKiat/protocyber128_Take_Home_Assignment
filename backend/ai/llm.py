

class Llm:
    def __init__(self):
        return ("This is a singleton. Use get_instance() instead")
    
    _instance = None
    _llm = None

    @classmethod
    def get_instance(cls):
        if cls._instance == None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    @property
    def llm(self):
        return self.llm
    
    @llm.setter
    def llm(self, value):
        self._llm = value
    
