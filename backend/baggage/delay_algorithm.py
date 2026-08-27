from django.utils import timezone

from .models import BaggageLocation


# Delay limits in minutes
WARNING_TIME = 15
HIGH_DELAY_TIME = 30


def check_delay(baggage):

    locations = BaggageLocation.objects.filter(
        baggage=baggage
    ).order_by("timestamp")

    # No location data
    if not locations.exists():
        return {
            "is_delayed": False,
            "message": "No location data yet"
        }

    # Only one location
    if locations.count() < 2:
        return {
            "is_delayed": False,
            "message": "Not enough location data to calculate delay"
        }

    last_location = locations.last()

    current_time = timezone.now()

    time_difference = (
        current_time - last_location.timestamp
    ).total_seconds() / 60

    if time_difference > HIGH_DELAY_TIME:

        return {
            "is_delayed": True,
            "delay_level": "HIGH",
            "delay_minutes": round(time_difference, 2),
            "location": last_location.location,
            "message": "HIGH BAGGAGE DELAY"
        }

    elif time_difference > WARNING_TIME:

        return {
            "is_delayed": True,
            "delay_level": "WARNING",
            "delay_minutes": round(time_difference, 2),
            "location": last_location.location,
            "message": "BAGGAGE DELAY WARNING"
        }

    else:

        return {
            "is_delayed": False,
            "delay_level": "NORMAL",
            "delay_minutes": round(time_difference, 2),
            "location": last_location.location,
            "message": "Baggage movement is normal"
        }