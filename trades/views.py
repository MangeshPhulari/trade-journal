from rest_framework import viewsets
from django.shortcuts import render
from .models import Trade
from .serializers import TradeSerializer

class TradeViewSet(viewsets.ModelViewSet):
    queryset = Trade.objects.all().order_by('-date')
    serializer_class = TradeSerializer

def home(request):
    return render(request, 'index.html')
