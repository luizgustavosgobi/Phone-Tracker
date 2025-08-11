import cv2 as cv
import numpy as np

from services.api_services import saveOccurrence, OccurrencesType
from datetime import datetime

def encodeToJpg(frame: np.ndarray) -> bytes:
    _, jpg = cv.imencode('.jpg', frame)

    return jpg.tobytes()

def sendToApi(camera_local: str, camera_id: int , occurrenceType: OccurrencesType, jpeg: bytes):
    saveOccurrence(
        dateTime=datetime.now().isoformat(),
        local=camera_local,
        cameraId=camera_id,
        type=occurrenceType,
        proofFile=("evidence.jpg", jpeg, 'image/jpg')
    )
