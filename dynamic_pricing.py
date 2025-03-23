import datetime

# Define peak periods as tuples (start_hour, end_hour)
PEAK_PERIODS = [
   (7, 10), # Morning rush hour (7-10am)
   (17, 19) # Evening rush hour (5-7pm)
]

# Defining the days that are weekends so pricing is more expensive 
# In our case, saturday which is day 5 of the week and sunday which is day 6 of the week in array form
weekend_days = [5, 6]
base_price = 10.0

def dynamic_pricing(current_time=None):
    if current_time is None:
        current_time = datetime.datetime.now()
    
    # Check if it's a weekend
    if current_time.weekday() in weekend_days:
        price_multiplier = 2.0  # Weekend pricing is 2.0x the regular price
    else:
        # Weekday pricing
        price_multiplier = 1.0
        # Loop to check if it is rush hour (within defined peak periods)
        for start, end in PEAK_PERIODS:
            if start <= current_time.hour < end:
                price_multiplier = 1.5  # Rush hour pricing is 1.5x the regular price
                break
    
    # Calculate final price
    final_price = base_price * price_multiplier
    return final_price
