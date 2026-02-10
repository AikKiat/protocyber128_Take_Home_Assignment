

import asyncio
import json

#This is the Singleton responsible for creating a stream buffer that sends input over via Server-Side Events (SSE) to the frontend. 
#The use case here is for the chatbot to update its analysis stage to the lay-end user, thus making the whole UI more engaging and less boring.

class StreamingQueue:

    _instance = None
    _queue = None
    _queue_size : int = 5

    def __init__(self):
        return ("This is a singleton. Use get_instance() instead")
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls.__new__(cls)

        return cls._instance
    
    @property
    def queue(self):
        return self._queue
    

    @property
    def queue_size(self):
        return self._queue_size

    @queue_size.setter
    def queue_size(self, value):
        self._queue_size = value

    def initialise_streaming_queue(self):
        self._queue = asyncio.Queue(maxsize=self._queue_size)

    async def stream_responses_while_available(self):
        try:
            while True:
                event = await self._queue.get()
                
                event_data = json.dumps(event)
                yield f"data: {event_data}\n\n"
                
                if event.get("type") == "done" or event.get("type") == "error":
                    break #stop the streaming when we have hit done, or error.
                    
        except asyncio.CancelledError:
            pass

        finally:
            self._queue = None #we do a clean up over here, and remove the instance of this Asyncio queue. So we save memory and avoid leaving it running even when we are not fetching AI generation results.