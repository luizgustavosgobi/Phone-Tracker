import math
import threading
import cv2 as cv
import cvzone

from ultralytics import YOLO

from managers.Id_manager import assign_global_id, isNotified, deleteExpiredIds
from services.reid_service import extract_features
from parsers.camera_parser import parseCameraConfigFile

THRESHOLD = 0.7

classNames = [
    "cellphone",
    "not_using",
    "using_cellphone"
]

def process_camera(camera_id, camera_url, camera_local):
    cap = cv.VideoCapture(camera_url)
    model = YOLO("models/roboflowTrains/yolov11-Balanced.pt")

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

                cvzone.cornerRect(frame, (x1, y1, w, h))

                conf = math.ceil((box.conf[0] * 100)) / 100
                name = classNames[int(box.cls[0])]

                track_id = None
                if box.id is not None:
                    track_id = int(box.id[0])
                
                if track_id is not None and not isNotified(track_id) and name == "using_cellphone" and conf > THRESHOLD:
                    crop = frame[y1:y2, x1:x2]
                    if crop.size > 0:
                        features = extract_features(crop)
                        global_id = assign_global_id(camera_id, track_id, features)
                        cvzone.putTextRect(frame, f"{global_id}", (x1, y1 - 20))

        cv.imshow(f"YOLO Detection - Camera {camera_id}", results[0].plot())
        if cv.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()

def main():
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

    thread = threading.Thread(target=deleteExpiredIds(), daemon=True)
    thread.start()
    
    for thread in threads:
        thread.join()

if __name__ == "__main__":
    main()