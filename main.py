import os
import firebase_admin
from firebase_admin import firestore, credentials
from ignore.getappcreds import getCreds
from google.api_core.datetime_helpers import DatetimeWithNanoseconds
import datetime
from datetime import datetime as dt
from pytz import timezone
from dateutil import tz


cred = getCreds()
app = firebase_admin.initialize_app(cred)
db = firestore.client()

allSpotsRef = db.collection("spots")

def getTime(date, time):
    dtStr = f"{date}T{time}:01Z"
    return DatetimeWithNanoseconds.from_rfc3339(dtStr).replace(tzinfo=tz.tzlocal()).astimezone(timezone('UTC'))

def getFreeTimes(floorNum, date, time):
    searchTime = getTime(date, time)

    spots = (allSpotsRef.where("floor", "==", floorNum).order_by(field_path="spot").stream())

    openings = {}

    for spot in (spots):
        print("SPOT\n\n", spot)
        spotId = spot.to_dict()['id']
        openings[spotId] = 1
        print("DICT", spot.to_dict())
        print("ID", spot.id)
        book = (db.collection("spots", spot.id, "bookings").stream())
        for b in book:
            if searchTime < b.to_dict()['endTime'] and searchTime > b.to_dict()['startTime']:
                openings[spotId] = 0
                break
            
    return openings


abcd = {'startTime': DatetimeWithNanoseconds(2025, 3, 10, 4, 0, 0, 605000, tzinfo=datetime.timezone.utc), 'endTime': DatetimeWithNanoseconds(2025, 3, 10, 19, 0, 0, 360000, tzinfo=datetime.timezone.utc), 'bookingId': 1, 'cost': 18}
print(abcd)

print("NOW", dt.now(timezone('UTC')))

to_zone = tz.tzlocal()

timeString = "2025-03-13T12:45:00-04:00"
timeStringNano = "2025-03-13T12:45:00Z"
dt2 = dt.fromisoformat(timeString)
print("TIME2", dt2)
dt2 = dt2.astimezone(timezone('UTC'))
print("TIME2", dt2)
ddd = DatetimeWithNanoseconds.from_rfc3339(timeStringNano).replace(tzinfo=tz.tzlocal()).astimezone(timezone('UTC'))
# ddd = ddd.astimezone(timezone('UTC'))
# print(ddd.rfc3339())
# ddd.astimezone(timezone.dst)
# ddd.from_rfc3339(timeString)
print(ddd)

spotArrs = getFreeTimes(0, "2025-03-13", "12:45")
print(spotArrs)


# db.collection("floors").document("floor0").collection("spots").document("spot0").set({
#     "bookings": [12, 13, 15,16]
# })