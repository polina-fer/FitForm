from fastapi import FastAPI, HTTPException
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
