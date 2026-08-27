from rest_framework import serializers
from .models import Baggage, BaggageLocation, BaggageAlert


class BaggageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Baggage
        fields = '__all__'


class BaggageLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaggageLocation
        fields = '__all__'
        read_only_fields = ['baggage', 'timestamp']


class BaggageAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaggageAlert
        fields = '__all__'
        read_only_fields = ['timestamp']