import datetime

PRICING_RULES = {
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

# provide duration as parameter as well
def dynamic_pricing(current_time: datetime.datetime = None, duration_hours: float = 1) -> float:
    """
    Calculate total parking price based on time of day, day of week, and duration.
    """
    if current_time is None:
        current_time = datetime.datetime.now() # Use current time if not provided

    rules = PRICING_RULES # Load pricing rules and different types under it

    # Determine base multiplier (weekend vs. weekday peak/off‑peak)
    if current_time.weekday() in rules["weekend_days"]: 
        multiplier = rules["weekend_multiplier"] # Apply weekend multiplier
    else:
        multiplier = 1.0
        for start, end in rules["peak_periods"]: # Check if current time is in peak period
            if start <= current_time.hour < end:
                multiplier = rules["peak_multiplier"] # Apply peak multiplier
                break

    total = rules["base_price"] * multiplier * duration_hours 

    # Apply best discount
    discounts = [disc for hrs, disc in rules["discount_tiers"].items() if duration_hours >= hrs] 
    discount = max(discounts, default=0) # 0 if no discount applies
    return round(total * (1 - discount), 2) # Round 


