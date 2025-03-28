import math
import mysql.connector # type: ignore
import random
import time
from datetime import datetime
from enum import Enum

class OccupationStatus(Enum):
    FREE = "Free"
    OCCUPIED = "Occupied"
    UNAVAILABLE = "Unavailable"

class OccupationType(Enum):
    PEAK = "Peak"
    OFF_PEAK = "Off-Peak"
    EARLY_BIRD = "Early Bird"


# MySQL Database Connection
DB_CONFIG = {
    "host": "localhost",
    "user": "user",
    "password": "password",
    "database": "project_name"
}


# Define peak hours
EARLY_BIRD_HOURS = [(5, 7)]  # 5 AM - 7 AM
OFF_PEAK_HOURS = [(7.001, 7.5), (9.501, 12), (13.501, 16), (17.001, 19)]  # 7:01 AM - 7:30 AM, 9:31 AM - 12 PM, 1:31 PM - 4 PM, 5:01 PM - 7 PM
PEAK_HOURS = [(7.501, 9.5), (12.001, 13.5), (16.001, 17)]  # 7:31 AM - 9:30 AM, 12:01 PM - 1:30 PM, 4:01 PM - 5 PM

# Define parking spot occupancy ranges per time and day
PEAK_OCCUPANCY = (0.6, 0.95)  # 70% - 95% occupancy during peak hours
OFF_PEAK_OCCUPANCY = (0.25, 0.5)  # 20% - 50% occupancy during off-peak hours
EARLY_BIRD_OCCUPANCY = (0, 0.20)  # 10% - 30% occupancy during early bird hours

# Defining refresh rate based on the time of the day
def get_refresh_rate():
    now = datetime.now()
    day = now.strftime("%A")
    time_real = now.hour + now.minute/60 # Current time in hours

    if day in ["Saturday", "Sunday"]:
        return 120 # 120 minutes on weekends

    for start, end in PEAK_HOURS:
        
        if start <= time_real <= end:
            time_left = (end - time_real) * 60  # Time left in minutes
            return min(5, time_left)  # 5 minutes or the time left, whichever is smaller

    for start, end in OFF_PEAK_HOURS:
        
        if start <= time_real <= end:
            time_left = (end - time_real) * 60  # Time left in minutes
            return min(15, time_left)  # 15 minutes or the time left, whichever is smaller

    for start, end in EARLY_BIRD_HOURS:
        if start <= time_real <= end:
            time_left = (end - time_real) * 60  # Time left in minutes
            return min(30, time_left)  # 30 minutes or the time left, whichever is smaller

    return 300  # 300 minutes during regular hours

# Function to determine occupancy probability
def get_expected_occupancy():
    now = datetime.now()
    hour = now.hour
    day = now.strftime("%A")
    time_real = now.hour + now.minute/60 # Current time in hours

    if day in ["Saturday", "Sunday"]:
        return random.uniform(0.1, 0.5)  # 10% - 50% occupancy on weekends

    if any(start <= time_real <= end for start, end in PEAK_HOURS):
        return random.uniform(PEAK_OCCUPANCY[0], PEAK_OCCUPANCY[1])  # 70% - 95% occupancy during peak hours

    if any(start <= time_real <= end for start, end in OFF_PEAK_HOURS):
        return random.uniform(OFF_PEAK_OCCUPANCY[0], OFF_PEAK_OCCUPANCY[1]) # 20% - 50% occupancy during off-peak hours
    
    if any(start <= time_real <= end for start, end in EARLY_BIRD_HOURS):
        return random.uniform(EARLY_BIRD_OCCUPANCY[0], EARLY_BIRD_OCCUPANCY[1]) # 10% - 30% occupancy during early bird hours
    
    return 0.5

# function to get the occupancy type based on the current time and day of the week
def get_occupancy_type():
    now = datetime.now()
    hour = now.hour
    day = now.strftime("%A")
    time_real = now.hour + now.minute/60 # Current time in hours

    if day in ["Saturday", "Sunday"]:
        return OccupationType.OFF_PEAK

    if any(start <= time_real <= end for start, end in PEAK_HOURS):
        return OccupationType.PEAK

    if any(start <= time_real <= end for start, end in OFF_PEAK_HOURS):
        return OccupationType.OFF_PEAK

    if any(start <= time_real <= end for start, end in EARLY_BIRD_HOURS):
        return OccupationType.EARLY_BIRD
    
#Function to find number of spots  in the database
def get_number_of_spots():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("SELECT COUNT(*) FROM spots")
        total_spots = cursor.fetchone()[0]

        cursor.close()
        connection.close()

        #print(f"Total number of parking spots: {total_spots}.")

        return total_spots

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return None
    
#function to create a given number of parking spots in the database
def create_multiple_parking_spots(total_spots, floor_id):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        for spot_id in range(1, total_spots + 1):
            cursor.execute("INSERT INTO spots (FloorId, SpotNumber, OccupationStatus) VALUES ( %s, %s, %s)", (floor_id, spot_id, "Free"))
            change_number_of_spots(floor_id, increment=True)

        connection.commit()
        cursor.close()
        connection.close()

        print(f"Created {total_spots} parking spots.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

# function to create a parking spot in the database and update the number of spots in the floor
def create_a_parking_spot(floor_id):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("SELECT TotalSpots FROM floors WHERE FloorId = %s", (floor_id,))
        total_spots = cursor.fetchone()[0]

        cursor.execute("INSERT INTO spots (FloorId, SpotNumber, OccupationStatus) VALUES (%s, %s, %s)", (floor_id, total_spots + 1, "Free"))
        connection.commit()

        change_number_of_spots(floor_id, increment=True)

        cursor.close()
        connection.close()

        print(f"Created parking spot {total_spots + 1}.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

#function to delete all parking spots in the database and update the number of spots in each floors
def delete_all_parking_spots():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("SELECT FloorId FROM floors")
        floor_ids = cursor.fetchall()

        cursor.execute("DELETE FROM spots")
        connection.commit()

        for floor_id in floor_ids:
            update_number_of_spots(floor_id, 0)

        cursor.close()
        connection.close()

        print("Deleted all parking spots.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

#function to delete a parking spot in the database and update the number of spots in the floor
def delete_a_parking_spot(spot_id, floor_id):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("DELETE FROM spots WHERE SpotId = %s", (spot_id,))
        connection.commit()

        change_number_of_spots(floor_id, increment=False)

        cursor.close()
        connection.close()

        print(f"Deleted parking spot {spot_id}.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

#function for setting a spot as occupied in the database
def set_spot_occupied(spot_id):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("UPDATE spots SET OccupationStatus = 'Occupied' WHERE SpotId = %s", (spot_id))
        connection.commit()

        cursor.close()
        connection.close()

        print(f"Spot {spot_id} is now occupied.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

#function for setting a spot as free in the database
def set_spot_free(spot_id):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("UPDATE spots SET OccupationStatus = 'Free' WHERE SpotId = %s", (spot_id))
        connection.commit()

        cursor.close()
        connection.close()

        print(f"Spot {spot_id} is now free.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

#function to set a spot as Unavailable in the database
def set_spot_unavailable(spot_id):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("UPDATE spots SET OccupationStatus = 'Unavailable' WHERE SpotId = %s", (spot_id,))
        connection.commit()

        cursor.close()
        connection.close()

        print(f"Spot {spot_id} is now unavailable.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

#function to retrieve list of occupied spots in the database
def get_occupied_spots():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("SELECT SpotId FROM spots WHERE OccupationStatus = 'Occupied'")
        occupied_spots = cursor.fetchall()

        cursor.close()
        connection.close()

        return occupied_spots

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return None
    
#function to retrieve list of non occupied spots in the database
def get_non_occupied_spots():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("SELECT SpotId FROM spots WHERE OccupationStatus = 'Free'")
        non_occupied_spots = cursor.fetchall()

        cursor.close()
        connection.close()

        return non_occupied_spots

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return None

# function to retrieve list of unavailable spots in the database
def get_unavailable_spots():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("SELECT SpotId FROM spots WHERE OccupationStatus = 'Unavailable'")
        unavailable_spots = cursor.fetchall()
      
        cursor.close()
        connection.close()

        return unavailable_spots

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return None


#function to increment or decrement the number of spots in the database
def change_number_of_spots(floor_id, increment:bool = True):
    """Increment or decrement the number of spots for a given floor. increment=True to add a spot, increment=False to remove a spot."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("SELECT TotalSpots FROM floors WHERE FloorId = %s", (floor_id,))
        total_spots = cursor.fetchone()[0]

        if increment:
            total_spots += 1
        else:
            total_spots -= 1

        cursor.execute("UPDATE floors SET TotalSpots = %s WHERE FloorId = %s", (total_spots, floor_id))
        connection.commit()

        cursor.close()
        connection.close()

        print(f"Changed number of spots for floor {floor_id}.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

#function to update the number of spots in the database
def update_number_of_spots(floor_id, total_spots):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("UPDATE floors SET TotalSpots = %s WHERE FloorId = %s", (total_spots, floor_id))
        connection.commit()

        cursor.close()
        connection.close()

        print(f"Updated number of spots for floor {floor_id}.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")

#function to retrieve list of spots that are booked in the database
def get_booked_spots():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("SELECT SpotId FROM bookings")
        booked_spots = cursor.fetchall()

        cursor.close()
        connection.close()

        return booked_spots

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return None

# function to compute actual occupancy based on the number of spots that are occupied, unavailable, and booked
def get_actual_occupancy():
    total_spots = get_number_of_spots()
    #print(total_spots)
    if total_spots is None:
        return None
    unavailable_spots = get_unavailable_spots()
    actual_usable_spots = total_spots - len(unavailable_spots)

    if total_spots is None:
        return None

    occupied_spots = get_occupied_spots()

    return len(occupied_spots) / actual_usable_spots

# Function to randomly update parking data based on occupancy probability. here is how it should proceed:
def start_update_parking_data():
    # Number of parking spots
    total_spots = get_number_of_spots()
    if total_spots is None:
        return
    
    while True:
        refresh_rate = get_refresh_rate() 
        refresh_rate_min = math.floor(refresh_rate)
        refresh_rate_sec = (refresh_rate - refresh_rate_min) * 60
        expected_occupancy = get_expected_occupancy()
        actual_occupancy = get_actual_occupancy()
        occupancy_type = get_occupancy_type()

        print(f"Current Data: Expected Occupancy: {expected_occupancy:.2f}, Actual Occupancy: {actual_occupancy:.2f}, "
              f"Demand Phase: {'PEAK' if occupancy_type == OccupationType.PEAK else 'Off-Peak' if occupancy_type == OccupationType.OFF_PEAK else 'Early-Bird'}, "
              f"Refreshing : {refresh_rate_min} minutes {refresh_rate_sec} sec.\n")
        
        print("Atempting to update data...\n")
        
        if occupancy_type == OccupationType.PEAK and actual_occupancy < expected_occupancy:
            spots_to_occupy = int(total_spots * expected_occupancy) - len(get_occupied_spots())
            non_occupied_spots = get_non_occupied_spots()
            random.shuffle(non_occupied_spots)

            for spot_id in non_occupied_spots[:spots_to_occupy]:
                set_spot_occupied(spot_id)

        elif occupancy_type == OccupationType.OFF_PEAK and actual_occupancy > OFF_PEAK_OCCUPANCY[1]:
            spots_to_free = len(get_occupied_spots()) - int(total_spots * expected_occupancy)
            occupied_spots = get_occupied_spots()
            booked_spots = get_booked_spots()
            occupied_spots = [spot_id for spot_id in occupied_spots if spot_id not in booked_spots]
            random.shuffle(occupied_spots)

            for spot_id in occupied_spots[:spots_to_free]:
                set_spot_free(spot_id)

        elif occupancy_type == OccupationType.OFF_PEAK and actual_occupancy < OFF_PEAK_OCCUPANCY[0]:
            spots_to_occupy = int(total_spots * expected_occupancy) - len(get_occupied_spots())
            non_occupied_spots = get_non_occupied_spots()
            random.shuffle(non_occupied_spots)

            for spot_id in non_occupied_spots[:spots_to_occupy]:
                set_spot_occupied(spot_id)

        elif occupancy_type == EARLY_BIRD_OCCUPANCY and actual_occupancy > EARLY_BIRD_OCCUPANCY[1]:
            spots_to_free = len(get_occupied_spots()) - int(total_spots * expected_occupancy)
            occupied_spots = get_occupied_spots()
            booked_spots = get_booked_spots()
            occupied_spots = [spot_id for spot_id in occupied_spots if spot_id not in booked_spots]
            random.shuffle(occupied_spots)

            for spot_id in occupied_spots[:spots_to_free]:
                set_spot_free(spot_id) 
        else:
            print("No need to update the parking data.")
            print(f"Refresh in {refresh_rate_min} minutes {refresh_rate_sec} sec.\n")
            time.sleep(refresh_rate*60)
            continue

        new_occupied_spots = get_occupied_spots()
        new_non_occupied_spots = get_non_occupied_spots()
        new_unavailable_spots = get_unavailable_spots()
        new_actual_occupancy = get_actual_occupancy()

        print(f"Parking data updated: Occupied spots: {len(new_occupied_spots)}, "
                f"Non-occupied spots: {len(new_non_occupied_spots)}, "
                f"Unavailable spots: {len(new_unavailable_spots)}, "
                f"Parking Occupancy: {float(new_actual_occupancy):.2f}.")
        print(f"Refresh in {refresh_rate_min} minutes {refresh_rate_sec} sec.\n")
        time.sleep(refresh_rate*60)
        

# function to book a parking spot
def book_parking_spot(spot_id, start_time, end_time):
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("INSERT INTO bookings (SpotId, StartTime, EndTime) VALUES (%s, %s, %s)", (spot_id, start_time, end_time))
        connection.commit()

        cursor.close()
        connection.close()

        print(f"Parking spot {spot_id} booked.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")


# Run simulation every 5 minutes
if __name__ == "__main__":
    print("\nParking Spots Data Update Program Running ...\n")
    start_update_parking_data()


