import threading
import time

from numpy import ndarray
from scipy.spatial.distance import cosine

from managers.database_manager import query_db, insert_db
from utils.vector_utils import normalize_vector

EXPIRATION_TIME = 5 # Seconds
CLEANUP_INTERVAL = 10 # Seconds
THRESHOLD = 0.7 # Float -> % Semelhança entre features

id_map: dict[tuple[int, int], tuple[int, float]] = {} # (camera_id, track_id): (global_id, last_time)
global_reid_db: dict[int, list[ndarray]] = {} # global_ID: list[feature]
global_id_counter: int = 1

def deleteExpiredIds():
    while True:
        expired_ids = [id for id, tuple in id_map.items() if time.time() - tuple[1] > EXPIRATION_TIME]
        for id in expired_ids:
            id_map.pop(id)
        time.sleep(CLEANUP_INTERVAL)

def addId(camera_id: int, track_id: int, global_track_id:int) -> None:
    id_map[(camera_id, track_id)] = (global_track_id, time.time())

def isNotified(track_id: int) -> bool:
    return track_id in id_map and not time.time() - id_map[track_id][1] > EXPIRATION_TIME

def assign_global_id(camera_id: int, local_track_id: int, features: ndarray) -> int:
    key = (camera_id, local_track_id)
    with threading.Lock():
        if key in id_map:
            return id_map[key][0]

        normalized_features = normalize_vector(features)
        result = query_db("SELECT student_id, 1 - (embedding <=> %s) AS similarity FROM tb_student_embeddings ORDER BY similarity DESC LIMIT 1", (normalized_features,))
        if result is not None and len(result) > 0:
            student_id, similarity = result[0]
            #insert_db("INSERT INTO tb_student_embeddings (student_id, embedding) VALUES(%s, %s)", ("CT3020216", normalized_features))
            print(student_id + ": " + str(similarity))

            if similarity > THRESHOLD:
                insert_db("INSERT INTO tb_student_embeddings (student_id, embedding) VALUES(%s, %s)", (student_id, normalized_features))
                id_map[key] = (student_id, time.time())
                return student_id

        # If not found any student embedding with similarity > THRESHOLD, see in the local global id map.

        best_gid = None
        best_sim = 0
        for gid, feat_list in global_reid_db.items():
            for feat in feat_list:
                sim = 1 - cosine(features, feat)
                if sim > best_sim and sim > THRESHOLD:
                    best_sim = sim
                    best_gid = gid

        if best_gid is not None:
            global_reid_db[best_gid].append(features)
            id_map[key] = (best_gid, time.time())
            return best_gid
        else:
            global global_id_counter
            new_id = global_id_counter
            global_id_counter += 1
            global_reid_db[new_id] = [features]
            id_map[key] = (new_id, time.time())
            return new_id