from typing import Annotated

from fastapi import FastAPI, Header, HTTPException, Body, Request, Response
from pydantic import BaseModel
from enum import Enum
import dbConnection as dbc
import json, os
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware



middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:5500/"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
]


app = FastAPI()
# @app.middleware("http")
# async def cors_handler(request: Request, call_next):
#     response: Response = await call_next(request)
#     response.headers['Access-Control-Allow-Credentials'] = 'true'
#     response.headers['Access-Control-Allow-Origin'] = ["http://127.0.0.1:5500"]
#     response.headers['Access-Control-Allow-Methods'] = '*'
#     response.headers['Access-Control-Allow-Headers'] = '*'
#     return response

app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],#["http://127.0.0.1:5500", "http://127.0.0.1:8000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
)


class Booking(BaseModel):
    spot: int
    user: int
    startTime: str
    endTime: str

class BookingWindow(BaseModel):
    start: str
    end: str


# Get
@app.get("/floors")
async def get_floors():
    floors = dbc.getFloors()
    return floors

# Get
@app.get("/floors/{floor_id}")
async def get_floor_info(floor_id: int):
    floor = dbc.getFloorInfo(floor_id)
    return floor

@app.get("/floors/{floor_id}/spots")
async def get_spots_on_floor(floor_id: int):
    spots = dbc.getFloorSpots(floor_id)
    return spots


@app.put("/floors/{floor_id}/available")
async def check_available_spots_on_floor(timeSlot: BookingWindow, floor_id: int):
    print("I", floor_id)
    print("S", timeSlot)
    spots = dbc.getSpotAvailability(timeSlot.start, timeSlot.end, floor_id)
    # print(spots)
    return spots #json.dumps(spots)

@app.get("/spots/{spot_id}/available")
async def check_available_spots_on_floor(timeSlot: BookingWindow, spot_id: int):
    print("I", spot_id)
    print("S", timeSlot)
    isfree = dbc.getSpotIsFree(timeSlot.start, timeSlot.end, spot_id)
    # print(spots)
    return {"free": isfree} #json.dumps(spots)


@app.post("/bookings")
async def create_new_booking(booking: Booking):
    if not dbc.getSpotIsFree(booking.startTime, booking.endTime, booking.spot):
        raise HTTPException(status_code=419, detail="Booking no longer available. Please try another spot.")
    bid = dbc.createBooking(booking.spot, booking.user, booking.startTime, booking.endTime, 30)
    return {"bookingId": bid}




