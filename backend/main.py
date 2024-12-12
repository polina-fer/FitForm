import shutil
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import tempfile
import shutil
import cv2
import mediapipe as mp

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class InputData(BaseModel):
    value: int


@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}


@app.get("/test")
async def test():
    return "Response from backend!"


mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


@app.post("/video")
async def video(file: UploadFile = File(...)):
    if file:
        print(f"File received: {file.filename}, Content-Type: {file.content_type}")

        # Save the uploaded file to a temporary location
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, suffix=f".{file.filename.split('.')[-1]}"
        )
        temp_file_path = temp_file.name
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process the video file with Mediapipe
        cap = cv2.VideoCapture(temp_file_path)

        with mp_pose.Pose(
            min_detection_confidence=0.5, min_tracking_confidence=0.5
        ) as pose:
            output_video_path = tempfile.NamedTemporaryFile(
                delete=False, suffix=".mp4"
            ).name
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            out = None

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                # Recolor image
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False

                # Make detection
                results = pose.process(image)

                # Recolor the image back
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                # Render detections
                if results.pose_landmarks:
                    mp_drawing.draw_landmarks(
                        image,
                        results.pose_landmarks,
                        mp_pose.POSE_CONNECTIONS,
                        mp_drawing.DrawingSpec(
                            color=(245, 245, 245), thickness=2, circle_radius=2
                        ),
                        mp_drawing.DrawingSpec(
                            color=(0, 245, 0), thickness=2, circle_radius=2
                        ),
                    )

                # Initialize video writer if not already initialized
                if out is None:
                    frame_height, frame_width = frame.shape[:2]
                    out = cv2.VideoWriter(
                        output_video_path, fourcc, 30, (frame_width, frame_height)
                    )

                out.write(image)

            cap.release()
            if out:
                out.release()

        # Return the processed video file
        return FileResponse(
            output_video_path, media_type="video/mp4", filename="processed_video.mp4"
        )

    return {"message": "Something went wrong"}
