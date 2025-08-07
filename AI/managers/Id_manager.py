import threading
import time

import numpy as np
from numpy import ndarray
from scipy.spatial.distance import cosine

from managers.database_manager import query_db, insert_db

EXPIRATION_TIME = 5 # Seconds
CLEANUP_INTERVAL = 10 # Seconds
THRESHOLD = 0.7 # Float -> % Semelhança entre features

id_map: dict[tuple[int, int], tuple[int, float]] = {} # (camera_id, track_id): (global_id, last_time)
global_id_counter: int = 1

def deleteExpiredIds():
    while True:
        expired_ids = [id for id, tuple in id_map.items() if time.time() - tuple[1] > EXPIRATION_TIME]
        for id in expired_ids:
            id_map.pop(id)
        time.sleep(CLEANUP_INTERVAL)

def addId(camera_id: int, track_id: int, global_track_id:int) -> None:
    id_map[(camera_id, track_id)] = (global_track_id, time.time())

def isNotified(camera_id: int, track_id: int) -> bool:
    return track_id in id_map and not time.time() - id_map[(camera_id, track_id)][1] > EXPIRATION_TIME

def assign_global_id(camera_id: int, local_track_id: int, features: ndarray) -> int:
    key = (camera_id, local_track_id)
    with threading.Lock():
        if key in id_map:
            return id_map[key][0]

        normalized_features = features / np.linalg.norm(features)

        result = query_db("SELECT student_id, tracking_id, 1 - (embedding <=> %s) AS similarity FROM tb_student_embeddings ORDER BY similarity DESC LIMIT 1",
                          (normalized_features,))

        if result is not None and len(result) > 0:
            student_id, tracking_id, similarity = result[0]

            if similarity > THRESHOLD:
                insert_db("INSERT INTO tb_student_embeddings (tracking_id, embedding) VALUES (%s, %s)", (tracking_id, normalized_features))

                id = student_id if student_id else tracking_id
                id_map[key] = (id, time.time())
                return id

        global global_id_counter
        new_id = global_id_counter
        global_id_counter += 1

        insert_db("INSERT INTO tb_student_embeddings (tracking_id, embedding) VALUES (%s, %s)", (new_id, normalized_features))
        id_map[key] = (new_id, time.time())

        return new_id