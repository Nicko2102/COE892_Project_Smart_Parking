import datetime

PRICING_RULES = {  # dictionary of pricing rules
    "base_price": 10.00,
    "weekend_multiplier": 2.0,
    "peak_multiplier": 1.5,
    "weekend_days": {5, 6},  # Saturday=5, Sunday=6
    "peak_periods": [(7, 10), (17, 19)],  # (start_hour, end_hour)
    "discount_tiers": {
        4: 0.05,    # 5% off for ≥4 hours
        8: 0.10,    # 10% off for ≥8 hours
        24: 0.20    # 20% off for ≥24 hours
    }
}

def dynamic_pricing(current_time: datetime.datetime = None, duration_hours: float = 1) -> float:
    
    #Calculate total parking price based on time of day, day of week, and duration.
    
    if current_time is None or not isinstance(current_time, datetime.datetime): # default to current time , time provided has issues
        current_time = datetime.datetime.now()

    if not isinstance(duration_hours, (int, float)): # checks duration type
        raise TypeError("duration_hours must be a number")
    if duration_hours <= 0: # checks if duration is positive
        raise ValueError("Duration must be positive")

    rules = PRICING_RULES

    if current_time.weekday() in rules["weekend_days"]: # checks if its a weekend
        multiplier = rules["weekend_multiplier"]
    else:
        multiplier = 1.0
        for start, end in rules["peak_periods"]: # checks if its peak time
            if start <= current_time.hour < end:
                multiplier = rules["peak_multiplier"]
                break

    total = rules["base_price"] * multiplier * duration_hours # calculates total price based on base price, multiplier and duration
    discounts = [disc for hrs, disc in rules["discount_tiers"].items() if duration_hours >= hrs] 
    discount = max(discounts, default=0)

    return round(total * (1 - discount), 2) 
