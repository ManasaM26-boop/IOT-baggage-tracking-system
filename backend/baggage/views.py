from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Baggage, BaggageLocation, BaggageAlert

from .serializers import (
    BaggageSerializer,
    BaggageLocationSerializer,
    BaggageAlertSerializer
)

from .path_algorithm import dijkstra, AIRPORT_GRAPH
from .route_comparison import compare_route
from .delay_algorithm import check_delay
from .progress_algorithm import calculate_progress
from .risk_algorithm import calculate_risk


EXPECTED_ROUTE = [
    "Check-in",
    "Baggage Screening",
    "Loading Area",
    "Aircraft"
]


def check_route(baggage):

    locations = BaggageLocation.objects.filter(
        baggage=baggage
    ).order_by('timestamp')

    if not locations.exists():

        return {
            "is_valid": True,
            "message": "No location data yet"
        }

    actual_route = [
        location.location
        for location in locations
    ]

    for i in range(1, len(actual_route)):

        previous_location = actual_route[i - 1]
        current_location = actual_route[i]

        if previous_location not in EXPECTED_ROUTE:

            return {
                "is_valid": False,
                "message": "MISROUTED BAG",
                "location": previous_location
            }

        previous_index = EXPECTED_ROUTE.index(
            previous_location
        )

        if current_location not in EXPECTED_ROUTE:

            return {
                "is_valid": False,
                "message": "MISROUTED BAG",
                "location": current_location
            }

        current_index = EXPECTED_ROUTE.index(
            current_location
        )

        if current_index < previous_index:

            return {
                "is_valid": False,
                "message": "WRONG ROUTE ORDER",
                "location": current_location
            }

    return {
        "is_valid": True,
        "message": "Route is valid"
    }


class BaggageViewSet(viewsets.ModelViewSet):

    queryset = Baggage.objects.all()
    serializer_class = BaggageSerializer


    # --------------------------------
    # UPDATE STATUS
    # --------------------------------

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):

        baggage = self.get_object()

        new_status = request.data.get('status')

        if not new_status:

            return Response(
                {
                    "error": "status is required"
                },
                status=400
            )

        baggage.status = new_status
        baggage.save()

        return Response(
            BaggageSerializer(baggage).data
        )


    # --------------------------------
    # LOCATION HISTORY
    # --------------------------------

    @action(detail=True, methods=['get', 'post'])
    def location(self, request, pk=None):

        baggage = self.get_object()

        if request.method == 'POST':

            location = request.data.get('location')
            status = request.data.get('status')

            if not location or not status:

                return Response(
                    {
                        "error":
                        "location and status are required"
                    },
                    status=400
                )

            baggage_location = BaggageLocation.objects.create(
                baggage=baggage,
                location=location,
                status=status
            )

            baggage.status = status
            baggage.save()

            route_result = check_route(baggage)

            if not route_result["is_valid"]:

                BaggageAlert.objects.create(
                    baggage=baggage,
                    alert_type=route_result["message"],
                    message=(
                        f"Baggage is at "
                        f"{route_result['location']}"
                    ),
                    location=route_result["location"]
                )

            return Response(
                {
                    "location_update":
                    BaggageLocationSerializer(
                        baggage_location
                    ).data,

                    "route_check":
                    route_result
                },
                status=201
            )

        locations = BaggageLocation.objects.filter(
            baggage=baggage
        ).order_by('timestamp')

        return Response(
            BaggageLocationSerializer(
                locations,
                many=True
            ).data
        )


    # --------------------------------
    # DIJKSTRA OPTIMAL ROUTE
    # --------------------------------

    @action(detail=True, methods=['get'])
    def optimal_route(self, request, pk=None):

        baggage = self.get_object()

        start = "Check-in"
        destination = "Aircraft"

        route, total_cost = dijkstra(
            AIRPORT_GRAPH,
            start,
            destination
        )

        if route is None:

            return Response(
                {
                    "error": "No route found"
                },
                status=404
            )

        return Response(
            {
                "baggage": baggage.bag_id,
                "start": start,
                "destination": destination,
                "optimal_route": route,
                "total_cost": total_cost
            }
        )


    # --------------------------------
    # ROUTE COMPARISON
    # --------------------------------

    @action(detail=True, methods=['get'])
    def compare_route(self, request, pk=None):

        baggage = self.get_object()

        result = compare_route(baggage)

        return Response(result)


    # --------------------------------
    # DELAY DETECTION
    # --------------------------------

    @action(detail=True, methods=['get'])
    def delay_check(self, request, pk=None):

        baggage = self.get_object()

        result = check_delay(baggage)

        if result.get("is_delayed"):

            BaggageAlert.objects.create(
                baggage=baggage,
                alert_type=result["delay_level"],
                message=result["message"],
                location=result["location"]
            )

        return Response(result)


    # --------------------------------
    # BAGGAGE PROGRESS
    # --------------------------------

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):

        baggage = self.get_object()

        result = calculate_progress(baggage)

        return Response(
            {
                "baggage": baggage.bag_id,
                "progress": result
            }
        )


    # --------------------------------
    # BAGGAGE RISK
    # --------------------------------

    @action(detail=True, methods=['get'])
    def risk(self, request, pk=None):

        baggage = self.get_object()

        result = calculate_risk(baggage)

        return Response(
            {
                "baggage": baggage.bag_id,
                "risk": result
            }
        )


    # --------------------------------
    # DASHBOARD API
    # --------------------------------

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):

        baggage = self.get_object()

        # Latest location
        latest_location = (
            BaggageLocation.objects
            .filter(baggage=baggage)
            .order_by('-timestamp')
            .first()
        )

        # Progress
        progress = calculate_progress(baggage)

        # Risk
        risk = calculate_risk(baggage)

        # Optimal route
        start = "Check-in"
        destination = "Aircraft"

        optimal_route, total_cost = dijkstra(
            AIRPORT_GRAPH,
            start,
            destination
        )

        # Alerts
        alerts = BaggageAlert.objects.filter(
            baggage=baggage
        ).order_by('-timestamp')

        return Response(
            {
                "baggage": {
                    "id": baggage.id,
                    "bag_id": baggage.bag_id,
                    "passenger_name": baggage.passenger_name,
                    "flight_number": baggage.flight_number,
                    "destination": baggage.destination,
                    "status": baggage.status
                },

                "current_location": (
                    latest_location.location
                    if latest_location
                    else None
                ),

                "progress": progress,

                "risk": risk,

                "optimal_route": optimal_route,

                "route_cost": total_cost,

                "alerts": BaggageAlertSerializer(
                    alerts,
                    many=True
                ).data
            }
        )


class BaggageAlertViewSet(viewsets.ModelViewSet):

    queryset = BaggageAlert.objects.all().order_by(
        '-timestamp'
    )

    serializer_class = BaggageAlertSerializer