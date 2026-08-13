from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, AdminStatsView

router = DefaultRouter()
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('', include(router.urls)),
]
