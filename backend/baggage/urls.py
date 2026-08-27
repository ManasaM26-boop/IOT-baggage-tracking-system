from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import BaggageViewSet, BaggageAlertViewSet


router = DefaultRouter()

router.register(r'baggage', BaggageViewSet)
router.register(r'alerts', BaggageAlertViewSet)


urlpatterns = [
    path('', include(router.urls)),
]