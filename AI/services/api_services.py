from datetime import datetime
from enum import Enum
from requests import Response

import requests

from managers.env_manager import getEnv

class OccurrencesType(Enum):
    CELLPHONE = "CELLPHONE"
    UNIFORM = "UNIFORM"
    OTHER = "OTHER"

API_URL = getEnv("API_URL")
API_KEY = getEnv("API_KEY")

def saveOccurrence(dateTime: str, local: str, cameraId: int, type: OccurrencesType, proofFile, trackingId: int|None = None, predictedStudent: str|None = None) -> Response :
    formData = {
        'date': (None, dateTime),
        'local': (None, local),
        'cameraId': (None, cameraId),
        'type': (None, type.value),

        'trackingId': (None, trackingId),
        'predictedStudent': (None, predictedStudent),
        
        'proof': proofFile
    }

    try:
        response = requests.post(url=f"{API_URL}/occurrences/create?api_key={API_KEY}", files=formData)
        return response
    except Exception as e:
        print(f"API Error: {str(e)}")
        raise
