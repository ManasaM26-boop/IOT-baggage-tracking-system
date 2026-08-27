from .models import BaggageLocation, BaggageAlert


def calculate_risk(baggage):

    risk_score = 0
    reasons = []

    # Get baggage location history
    locations = BaggageLocation.objects.filter(
        baggage=baggage
    ).order_by('timestamp')

    # No location data
    if not locations.exists():
        return {
            "risk_score": 0,
            "risk_level": "LOW",
            "reasons": ["No location data available"]
        }

    # Check alerts
    alerts = BaggageAlert.objects.filter(
        baggage=baggage,
        resolved=False
    )

    for alert in alerts:

        if "MISROUTED" in alert.alert_type:
            risk_score += 40
            reasons.append("Misrouted baggage detected")

        elif "WRONG ROUTE" in alert.alert_type:
            risk_score += 40
            reasons.append("Wrong route order detected")

        elif alert.alert_type == "HIGH":
            risk_score += 40
            reasons.append("High baggage delay detected")

        elif alert.alert_type == "WARNING":
            risk_score += 20
            reasons.append("Baggage delay warning")

    # Check latest location
    latest_location = locations.last().location

    if latest_location not in [
        "Check-in",
        "Baggage Screening",
        "Loading Area",
        "Aircraft"
    ]:
        risk_score += 30
        reasons.append("Unknown baggage location")

    # Maximum score = 100
    risk_score = min(risk_score, 100)

    # Determine risk level
    if risk_score >= 70:
        risk_level = "HIGH"

    elif risk_score >= 40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    if not reasons:
        reasons.append("Baggage movement is normal")

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons
    }