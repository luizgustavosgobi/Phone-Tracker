import math
import threading
import time
from datetime import datetime

import cv2 as cv
import cvzone

import supervision as sv
from ultralytics import YOLO

from ReId.trackers.core.deepsort.tracker import DeepSORTTracker
from ReId.trackers.core.reid.model import ReIDModel

#from trackers import DeepSORTTracker, DeepSORTFeatureExtractor

from ReId.feature_extractor import FeatureExtractor
from managers.Id_manager import assign_global_id, isNotified, isGlobalIdNotified, deleteExpiredIds, notify
from services.reid_service import extract_features
from parsers.camera_parser import parseCameraConfigFile
from services.api_services import saveOccurrence, OccurrencesType
from utils.image_utils import encodeToJpg

import timm

THRESHOLD = 0.65

classNames = [
    "cellphone",
    "not_using",
    "using_cellphone"
]

color = sv.ColorPalette.from_hex([
    "#ffff00", "#ff9b00", "#ff8080", "#ff66b2", "#ff66ff", "#b266ff",
    "#9999ff", "#3399ff", "#66ffff", "#33ff99", "#66ff66", "#99ff00"
])

box_annotator = sv.BoxAnnotator(
    color=color,
    color_lookup=sv.ColorLookup.TRACK)

trace_annotator = sv.TraceAnnotator(
    color=color,
    color_lookup=sv.ColorLookup.TRACK,
    thickness=2,
    trace_length=100)

label_annotator = sv.LabelAnnotator(
    color=color,
    color_lookup=sv.ColorLookup.TRACK,
    text_color=sv.Color.BLACK,
    text_scale=0.8)

reid_model = ReIDModel.from_timm("resnetv2_50.a1h_in1k")
tracker = DeepSORTTracker(reid_model=reid_model)

def process_camera(camera_id, camera_url, camera_local):
    cap = cv.VideoCapture(camera_url)
    model = YOLO("models/yolov11n-Balanced.pt")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame, verbose=False)
        for result in results:
            detections = sv.Detections.from_ultralytics(result)
            detections = tracker.update(detections, frame)
            if detections is not None and len(detections) > 0:
                for xyxy, conf, classId, trackerId, data in zip(detections.xyxy, detections.confidence, detections.class_id, detections.tracker_id, detections.data):
                    x1, y1, x2, y2 = int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])
                    w, h = x2 - x1, y2 - y1

                    conf = math.ceil((conf * 100)) / 100
                    name = classNames[classId]
                    if name == "using_cellphone" and conf > THRESHOLD:
                        #cvzone.cornerRect(frame, (x1, y1, w, h))
                        #cvzone.putTextRect(frame, f"{trackerId}", (x1, y1 - 20))

                        box_annotator.annotate(frame, detections)
                        trace_annotator.annotate(frame, detections)
                        label_annotator.annotate(frame, detections, detections.tracker_id)

        cv.imshow(f"YOLO Detection - Camera {camera_id}", frame)
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