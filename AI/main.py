import threading
from datetime import datetime

import cv2 as cv
import cvzone
from rfdetr import RFDETRSmall
import supervision as sv

from ReId.feature_extractor import FeatureExtractor
from ReId.trackers import ReIDModel, DeepSORTTracker
from managers.Id_manager import assign_global_id, isNotified, isGlobalIdNotified, deleteExpiredIds, notify
from parsers.camera_parser import parseCameraConfigFile
from services.api_services import saveOccurrence, OccurrencesType
from utils.image_utils import encodeToJpg

THRESHOLD = 0.75
SHOW_STUDENT_ID = True

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

    model = RFDETRSmall(pretrain_weights="models/rfdetr-s-finalDataset.pt", num_classes=3)
    model.optimize_for_inference()
    extractor = FeatureExtractor(
        model_name='osnet_x1_0',
        model_path='models/model.pth.tar-50',
        device='cpu',
    )

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

                        features = extractor.extract(crop)
                        global_id, student_id = assign_global_id(camera_id, track_id, features)

                        frame_copy = frame.copy()
                        cvzone.cornerRect(frame_copy, (x1, y1, x2-x1, y2-y1))
                        if SHOW_STUDENT_ID:
                            cvzone.putTextRect(frame_copy, f"{student_id if student_id else global_id}", (x1, y1 - 20))

                        if not isGlobalIdNotified(global_id):
                            print(f"NOTIFIED - {global_id} {track_id}")
                            notify(global_id)

                            saveOccurrence(
                                dateTime=datetime.now().isoformat(),
                                local=camera_local,
                                cameraId=camera_id,
                                type=OccurrencesType.CELLPHONE,

                                trackingId=global_id,
                                predictedStudent=student_id,

                                proofFile=("evidence.jpg", encodeToJpg(frame_copy), 'image/jpg')
                            )

            box_annotator.annotate(frame, results)
            trace_annotator.annotate(frame, results)
            label_annotator.annotate(frame, results, results.tracker_id)

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