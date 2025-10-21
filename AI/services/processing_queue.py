from datetime import datetime
from queue import Queue, Empty
import threading
import time
from typing import Dict

import cvzone

from ReId.feature_extractor import FeatureExtractor
from managers.Id_manager import assign_global_id, isGlobalIdNotified, notify
from services.api_services import saveOccurrence, OccurrencesType
from services.occurrence_queue import occurrence_queue
from utils.image_utils import encodeToJpg

extractor = FeatureExtractor(
        model_name='osnet_x1_0',
        model_path='models/model.pth.tar-50',
        device='cpu',
    )

class ProcessingQueue:
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

            features = extractor.extract(data['crop'])
            global_id, student_id = assign_global_id(data['camera_id'], data['track_id'], features)

            x1, y1, x2, y2 = int(data['xyxy'][0]), int(data['xyxy'][1]), int(data['xyxy'][2]), int(data['xyxy'][3])

            cvzone.cornerRect(data['frame'], (x1, y1, x2 - x1, y2 - y1))
            if data['show_student_id']:
                cvzone.putTextRect(data['frame'], f"{student_id if student_id else global_id}", (x1, y1 - 20))

            if not isGlobalIdNotified(global_id):
                print(f"NOTIFIED! Camera: {data['camera_id']} - Global ID {global_id}, Local ID {data['track_id']}")
                notify(global_id)

                occurrence_queue.enqueue({
                    "dateTime": datetime.now().isoformat(),
                    "local": data['camera_local'],
                    "cameraId": data['camera_id'],
                    "type": OccurrencesType.CELLPHONE,
                    "trackingId": global_id,
                    "predictedStudent": student_id,
                    "proofFile": ("evidence.jpg", encodeToJpg(data['frame']), 'image/jpg')
                })

            self.q.task_done()

    def stop(self, wait: bool = True):
        self._stop_event.set()
        if wait and self.thread.is_alive():
            self.thread.join()


processingQueue = ProcessingQueue()

