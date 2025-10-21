from queue import Queue, Empty
import threading
import time
from typing import Dict

from services.api_services import saveOccurrence


class OccurrenceQueue:
    def __init__(self, maxsize: int = 0):
        self.q = Queue(maxsize=maxsize)
        self._stop_event = threading.Event()

        self.thread = threading.Thread(target=self._worker, daemon=True)
        self.thread.start()

    def enqueue(self, data: Dict):
        self.q.put(data)

    def _worker(self):
        while not self._stop_event.is_set():
            try:
                data = self.q.get(timeout=0.5)
            except Empty:
                continue

            attempts = 0
            while attempts < 3:
                try:
                    saveOccurrence(**data)
                    break
                except Exception as e:
                    attempts += 1
                    time.sleep(2 ** attempts)
            self.q.task_done()

    def stop(self, wait: bool = True):
        self._stop_event.set()
        if wait and self.thread.is_alive():
            self.thread.join()


occurrence_queue = OccurrenceQueue()

