from .models import BaggageLocation


EXPECTED_ROUTE = [
    "Check-in",
    "Baggage Screening",
    "Loading Area",
    "Aircraft"
]


def calculate_progress(baggage):

    locations = BaggageLocation.objects.filter(
        baggage=baggage
    ).order_by("timestamp")

    if not locations.exists():
        return {
            "current_location": None,
            "progress_percentage": 0,
            "message": "Baggage has not started its journey"
        }

    current_location = locations.last().location

    if current_location not in EXPECTED_ROUTE:
        return {
            "current_location": current_location,
            "progress_percentage": 0,
            "message": "Unknown baggage location"
        }

    current_index = EXPECTED_ROUTE.index(current_location)

    total_steps = len(EXPECTED_ROUTE) - 1

    progress_percentage = round(
        (current_index / total_steps) * 100
    )

    if progress_percentage == 100:
        message = "Baggage journey completed"

    else:
        message = "Baggage journey in progress"

    return {
        "current_location": current_location,
        "progress_percentage": progress_percentage,
        "message": message
    }