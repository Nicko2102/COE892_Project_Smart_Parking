import datetime

 # Peak hours for weekdays (24 hour time so that means peak hours are 7am-10-am and 5pm-7pm)
peak_hours_start = [7, 17]
peak_hours_end = [10, 19]

# Defining the days that are weekends so pricing is more expensive 
# In our case, saturday which is day 5 of the week and sunday which is day 6 of the week in array form
weekend_days = [5, 6]  
base_price = 10.0

def dynamic_pricing(current_time=None):
    if current_time is None:
        current_time = datetime.datetime.now()
    # Loop to check if the current day is a weekend day
    if current_time.weekday() in weekend_days:
        price_multiplier = 2.0 # Making weekend pricing 2.0x the regular price
    else:
        # Weekday pricing
        price_multiplier = 1.0
        # Loop to check if it is rush hour
        for start, end in zip(peak_hours_start, peak_hours_end):
            if start <= current_time.hour < end:
                price_multiplier = 1.5 # Making rush hour pricing 1.5x the regular price
                break
    # Calculate final price
    final_price = base_price * price_multiplier
    return final_price
s
