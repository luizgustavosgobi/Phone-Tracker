import math
import threading
import time
from datetime import datetime

import cv2 as cv
import cvzone

from ultralytics import YOLO

from ReId.feature_extractor import FeatureExtractor
from managers.Id_manager import assign_global_id, isNotified, isGlobalIdNotified, deleteExpiredIds, notify
from services.reid_service import extract_features
from parsers.camera_parser import parseCameraConfigFile
from services.api_services import saveOccurrence, OccurrencesType
from utils.image_utils import encodeToJpg

THRESHOLD = 0.65

classNames = [
    "cellphone",
    "not_using",
    "using_cellphone"
]

def process_camera(camera_id, camera_url, camera_local):
    cap = cv.VideoCapture(camera_url)

    model = YOLO("models/roboflowTrains/yolov11-Balanced.pt")
    extractor = FeatureExtractor(
        model_name='osnet_x1_0',
        model_path='models/model.pth.tar-50',
        device='cpu',
    )

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model.track(frame, persist=True, verbose=False)
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                w, h = x2 - x1, y2 - y1

                conf = math.ceil((box.conf[0] * 100)) / 100
                name = classNames[int(box.cls[0])]

                track_id = None
                if box.id is not None:
                    track_id = int(box.id[0])

                if track_id is not None and not isNotified(camera_id, track_id) and name == "using_cellphone" and conf > THRESHOLD:
                    crop = frame[y1:y2, x1:x2]
                    if crop.size > 0:
                        features = extractor.extract(crop)
                        #features = extract_features(crop)
                        global_id, student_id = assign_global_id(camera_id, track_id, features)
                        cvzone.cornerRect(frame, (x1, y1, w, h))
                        cvzone.putTextRect(frame, f"{student_id if student_id else global_id}", (x1, y1 - 20))

                        if not isGlobalIdNotified(global_id):
                            notify(global_id)

                            saveOccurrence(
                                dateTime=datetime.now().isoformat(),
                                local=camera_local,
                                cameraId=camera_id,
                                type=OccurrencesType.CELLPHONE,

                                trackingId=global_id,
                                predictedStudent=student_id,

                                proofFile=("evidence.jpg", encodeToJpg(frame), 'image/jpg')
                            )

        cv.imshow(f"YOLO Detection - Camera {camera_id}", results[0].plot())
        if cv.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()

if __name__ == "__main__":
    cameras = parseCameraConfigFile()
    threads = []

    for camera_id, camera_tuple in cameras.items():
        thread = threading.Thread(
            target=process_camera,
            args=(camera_id, camera_tuple[0], camera_tuple[1]),
            daemon=False
        )
        thread.start()
        threads.append(thread)

        print(f"Thread started for camera {camera_id}")

    thread = threading.Thread(target=deleteExpiredIds, daemon=True)
    thread.start()

    for thread in threads:
        thread.join()