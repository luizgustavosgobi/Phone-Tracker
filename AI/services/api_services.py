from datetime import datetime
from enum import Enum

from numpy import ndarray
from requests import Response

import requests

from managers.database_manager import insert_db, query_db
from managers.env_manager import getEnv

class OccurrencesType(Enum):
    CELLPHONE = "CELLPHONE"
    UNIFORM = "UNIFORM"
    OTHER = "OTHER"

API_URL = getEnv("API_URL")
API_KEY = getEnv("API_KEY")

SESSION = requests.Session()

def saveOccurrence(dateTime: str, local: str, cameraId: int, type: OccurrencesType, proofFile, trackingId: int|None = None, predictedStudent: str|None = None, timeout: int = 5) -> Response:
    formData = {
        'date': (None, dateTime),
        'local': (None, local),
        'cameraId': (None, cameraId),
        'type': (None, type.value),

        'trackingId': (None, trackingId),
        'predictedStudent': (None, predictedStudent),
        
        'proof': proofFile
    }

    url = f"{API_URL}/occurrences/create?api_key={API_KEY}"
    try:
        response = SESSION.post(url=url, files=formData, timeout=timeout)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        raise
