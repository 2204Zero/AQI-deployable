from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from datetime import datetime

class Reading(BaseModel):
    device_id: str
    temperature: float
    humidity: float
    pm25: float
    pm10: float
    mq135_raw: float
    mq135_ppm: float


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_data = {}


@app.post("/esp32/readings")
async def receive_reading(reading: Reading):
    latest_data[reading.device_id] = reading.dict()
    print("Received:", reading.dict())
    return {"status": "ok", "device_id": reading.device_id}

@app.get("/esp32/latest")
async def get_latest():
    return latest_data


# Additional endpoints for compatibility
@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy", "devices": len(latest_data)}

@app.get("/esp32/devices")
def get_devices():
    return {"devices": list(latest_data.keys())}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5008)


