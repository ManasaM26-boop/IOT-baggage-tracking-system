from .models import BaggageLocation
from .path_algorithm import dijkstra, AIRPORT_GRAPH


def compare_route(baggage):

    # Get the optimal route using Dijkstra
    optimal_route, total_cost = dijkstra(
        AIRPORT_GRAPH,
        "Check-in",
        "Aircraft"
    )

    if optimal_route is None:
        return {
            "is_valid": False,
            "message": "No optimal route found"
        }

    # Get actual baggage locations
    locations = BaggageLocation.objects.filter(
        baggage=baggage
    ).order_by("timestamp")

    actual_route = [
        location.location
        for location in locations
    ]

    # If there is no actual location yet
    if not actual_route:
        return {
            "is_valid": True,
            "message": "No baggage location data yet",
            "optimal_route": optimal_route
        }

    # Check whether every actual location exists
    # in the airport graph
    for location in actual_route:

        if location not in AIRPORT_GRAPH:

            return {
                "is_valid": False,
                "message": "UNKNOWN LOCATION",
                "location": location,
                "actual_route": actual_route,
                "optimal_route": optimal_route
            }

    # Compare actual route with optimal route
    expected_positions = {
        location: index
        for index, location in enumerate(optimal_route)
    }

    previous_position = -1

    for location in actual_route:

        if location not in expected_positions:

            return {
                "is_valid": False,
                "message": "ROUTE DEVIATION",
                "location": location,
                "actual_route": actual_route,
                "optimal_route": optimal_route
            }

        current_position = expected_positions[location]

        if current_position < previous_position:

            return {
                "is_valid": False,
                "message": "WRONG ROUTE ORDER",
                "location": location,
                "actual_route": actual_route,
                "optimal_route": optimal_route
            }

        previous_position = current_position

    return {
        "is_valid": True,
        "message": "Baggage is following the optimal route",
        "actual_route": actual_route,
        "optimal_route": optimal_route,
        "total_cost": total_cost
    }