from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TradeViewSet, home

router = DefaultRouter()
router.register(r'trades', TradeViewSet, basename='trade')

urlpatterns = [
    path('', home, name='home'),       # index.html
    path('api/', include(router.urls)), # API
]
