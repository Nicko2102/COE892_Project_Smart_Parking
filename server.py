from typing import Annotated

from fastapi import FastAPI, Header, HTTPException, Body, Request, Response
from pydantic import BaseModel
from enum import Enum
import dbConnection as dbc
import json, os, datetime
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from dynamic_pricing import dynamic_pricing as getPrice
from datetime import datetime as dt
import threading


locks = {}

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

@app.get("/spots/{spot_id}")
async def get_spot_info(spot_id: int):
    spot = dbc.getSpotInfo(spot_id)
    return spot
    

@app.put("/spots/{spot_id}/available")
async def check_available_spots_on_floor(timeSlot: BookingWindow, spot_id: int):
    print("I", spot_id)
    print("S", timeSlot)
    isfree = dbc.getSpotIsFree(timeSlot.start, timeSlot.end, spot_id)
    if isfree:
        start = dt.fromisoformat(timeSlot.start)
        hours = (dt.fromisoformat(timeSlot.end) - start).total_seconds() / 3600
        print(hours)
        price = getPrice(start, hours)
        return {"free": isfree, "price": price} #json.dumps(spots)

    # print(spots)
    return {"free": isfree, "price": 0} #json.dumps(spots)

@app.post("/spots/{spot_id}/lock")
async def lock_spot(timeSlot: BookingWindow, spot_id: int):
    print("I", spot_id)
    print("S", timeSlot)
    realStart = dt.fromisoformat(timeSlot.start)
    realEnd = dt.fromisoformat(timeSlot.end)
    isLocked = False
    if spot_id in locks:
        for s, e, _ in locks[spot_id]:
            if dt.fromisoformat(s) < realEnd and dt.fromisoformat(e) > realStart:
                isLocked = True
                break
    
    print("L1", locks)
    
    if isLocked:
        print("ALREADY IN USE")
        # raise HTTPException(status_code=421, detail="Another user is currently booking this spot. Please check back in 30 seconds.")
        return {"success": False}
    else:
        print("VALID")
        if spot_id in locks:
            locks[spot_id].append([timeSlot.start, timeSlot.end, int(dt.now().timestamp())])
        else:
            locks[spot_id] = [[timeSlot.start, timeSlot.end, int(dt.now().timestamp())]]
        print("L2", locks)
        return {"success": True}
    
@app.delete("/spots/{spot_id}/lock")
async def unlock_spot(timeSlot: BookingWindow, spot_id: int):
    print("I", spot_id)
    print("S", timeSlot)
    # realStart = dt.fromisoformat(timeSlot.start)
    # realEnd = dt.fromisoformat(timeSlot.end)
    removed = False
    print("U1", locks)
    if spot_id in locks:
        for i in range(len(locks[spot_id])):
            print(i, locks[spot_id][i])
            if locks[spot_id][i][0] == timeSlot.start and locks[spot_id][i][1] == timeSlot.end:
                locks[spot_id].pop(i)
                if len(locks[spot_id]) == 0:
                    del locks[spot_id]
                removed = True
                break
    
    print("U2", locks)
    
    if not removed:
        print("Spot unlock error")
        raise HTTPException(status_code=422, detail="Lock somehow does not exist.")
    else:
        print("Spot UNLOCKED")
        return {"success": True}

@app.post("/bookings")
async def create_new_booking(booking: Booking):
    if not dbc.getSpotIsFree(booking.startTime, booking.endTime, booking.spot):
        raise HTTPException(status_code=419, detail="Booking no longer available. Please try another spot.")
    bid = dbc.createBooking(booking.spot, booking.user, booking.startTime, booking.endTime, 30)
    return {"bookingId": bid}


def clearLocks():
    empties = []
    for key in locks:
        for i in range(len(locks[key]) - 1, -1, -1):
            if locks[key][i][2] + 20 < int(dt.now().timestamp()):
                print("Lock removed:", locks[key][i])
                locks[key].pop(i)
                if len(locks[key]) == 0:
                    empties.append(key)
    
    for k in empties:
        del locks[k]
    
    clearLocksThread.run()

clearLocksThread = threading.Timer(5, clearLocks)
clearLocksThread.daemon = True
clearLocksThread.start()


