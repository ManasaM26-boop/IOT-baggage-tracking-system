from django.db import models


class Baggage(models.Model):
    bag_id = models.CharField(max_length=50, unique=True)
    passenger_name = models.CharField(max_length=100)
    flight_number = models.CharField(max_length=20)
    destination = models.CharField(max_length=100)
    status = models.CharField(max_length=50)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.bag_id


class BaggageLocation(models.Model):
    baggage = models.ForeignKey(
        Baggage,
        on_delete=models.CASCADE,
        related_name='location_history'
    )
    location = models.CharField(max_length=100)
    status = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.baggage.bag_id} - {self.location}"


class BaggageAlert(models.Model):
    baggage = models.ForeignKey(
        Baggage,
        on_delete=models.CASCADE,
        related_name='alerts'
    )
    alert_type = models.CharField(max_length=100)
    message = models.CharField(max_length=255)
    location = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.baggage.bag_id} - {self.alert_type}"