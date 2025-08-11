import cv2 as cv
import numpy as np

from services.api_services import saveOccurrence, OccurrencesType
from datetime import datetime

def encodeToJpg(frame: np.ndarray) -> bytes:
    _, jpg = cv.imencode('.jpg', frame)

    return jpg.tobytes()