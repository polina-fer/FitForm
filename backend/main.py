from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

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


@app.post("/video")
async def video(file: UploadFile = File(...)):
    if file:
        return "succcess"
    return "something went wrong"
