#
# Não funcionando no momento, corrigir
#

import io
import time
from datetime import datetime
from io import BytesIO
import av
import cv2 as cv
from numpy import ndarray

from services.api_services import saveOccurrence, OccurrencesType
from parsers.camera_parser import getCameraInfos

tracksId: dict[int, tuple[float, int, list[ndarray]]] = {}

def deleteExpiredTracksId():
    while True:
        expired_ids = [id for id, tuple in tracksId.items() if time.time() - tuple[0] > 0.5]
        for id in expired_ids:
            lastTime, camera_Id, frames = tracksId.pop(id)
            if len(frames) == 0:
                continue

            video = create_video(frames)
            try:
                duration = getVideoDuration(video)
                if duration > 1:
                    _, local = getCameraInfos(camera_Id)
                    sendToApi(local, camera_Id, OccurrencesType.CELLPHONE, video)
            except av.error.InvalidDataError as e:
                print(f"Invalid video data: {str(e)} - Skipping")
            except Exception as e:
                print(f"Unexpected error in duration check: {str(e)} - Skipping")
        time.sleep(0.5)

def addFrameToId(global_id: int, camera_id: int, frame: ndarray):
    if global_id not in tracksId:
        tracksId[global_id] = (time.time(), camera_id, [frame])
    else:
        lastTime, current_camera, frames = tracksId[global_id]
        frames.append(frame)
        tracksId[global_id] = (time.time(), camera_id, frames)

def isNotified(track_id: int):
    return track_id in tracksId

def create_video(frames: list[ndarray]) -> BytesIO:
    buffer = io.BytesIO()

    output_container = av.open(buffer, mode='w', format='mp4')

    height, width = frames[0].shape[:2]

    stream = output_container.add_stream('libx264', rate=30)
    stream.width = width
    stream.height = height
    stream.pix_fmt = 'yuv420p'
    stream.options = {'crf': '28'}

    for frame_bgr in frames:
        frame_rgb = cv.cvtColor(frame_bgr, cv.COLOR_BGR2RGB)
        frame_av = av.VideoFrame.from_ndarray(frame_rgb, format='rgb24')
        packet = stream.encode(frame_av)
        if packet:
            output_container.mux(packet)

    packets = stream.encode(None)
    for packet in packets:
        output_container.mux(packet)

    output_container.close()

    return buffer

def getVideoDuration(buffer: BytesIO) -> float:
    input_container = av.open(buffer, mode='r')

    return input_container.duration / av.time_base

def sendToApi(camera_local: str, camera_id: int , occurrenceType: OccurrencesType, video: BytesIO):
    saveOccurrence(
        dateTime=datetime.now().isoformat(),
        local=camera_local,
        cameraId=camera_id,
        type=occurrenceType,
        proofFile=("evidence.mp4", video, 'video/mp4')
    )
