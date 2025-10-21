import threading
import time
from datetime import datetime

import cv2 as cv
import cvzone
import numpy as np
import torch
from rfdetr import RFDETRSmall
import supervision as sv
from torchvision.models import ResNet18_Weights
from trackers import DeepSORTTracker, DeepSORTFeatureExtractor

from managers.Id_manager import isNotified, deleteExpiredIds
from parsers.camera_parser import parseCameraConfigFile
from services.processing_queue import processingQueue

THRESHOLD = 0.75
SHOW_STUDENT_ID = True

classNames = [
    "cellphone",
    "not_using",
    "using_cellphone"
]

def process_camera(camera_id, camera_url, camera_local):
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

    cap = cv.VideoCapture(camera_url)
    cap_fps = cap.get(cv.CAP_PROP_FPS)

    model = RFDETRSmall(pretrain_weights="models/rfdetr-s-1200.pt", num_classes=3)

    feature_extractor = DeepSORTFeatureExtractor.from_timm(model_name="mobilenetv4_conv_small.e1200_r224_in1k")
    tracker = DeepSORTTracker(feature_extractor=feature_extractor)

    prev_time = time.perf_counter()
    fps = 0.0
    smoothing = 0.9

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model.predict(frame, threshold=THRESHOLD)
        results = tracker.update(results, frame)

        if results is not None and len(results) > 0:
            for xyxy, conf, classId, track_id in zip(results.xyxy, results.confidence, results.class_id, results.tracker_id):
                name = classNames[classId-1]
                x1,y1,x2,y2 = int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])

                if not isNotified(camera_id, track_id) and name == "using_cellphone":
                    crop = frame[y1:y2, x1:x2]

                    if crop.size > 0:
                        processingQueue.enqueue({
                            "camera_id": camera_id,
                            "camera_local": camera_local,
                            "track_id": track_id,
                            "xyxy": xyxy,
                            "frame": frame.copy(),
                            "crop": crop,
                            "show_student_id": SHOW_STUDENT_ID
                        })

            box_annotator.annotate(frame, results)
            trace_annotator.annotate(frame, results)
            label_annotator.annotate(frame, results, results.tracker_id)

        now = time.perf_counter()
        dt = now - prev_time
        if dt > 0:
            inst_fps = 1.0 / dt
            fps = (smoothing * fps) + ((1 - smoothing) * inst_fps) if fps > 0 else inst_fps
        prev_time = now

        fps_text = f"FPS: {fps:.1f}"
        if cap_fps and cap_fps > 0:
            fps_text += f" (cam: {int(cap_fps)})"
        cv.putText(frame, fps_text, (10, 30), cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        cv.imshow(f"Detection - Camera {camera_id}", frame)
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
