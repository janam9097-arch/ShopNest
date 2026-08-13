from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user orders and admin actions."""
    serializer_class = OrderSerializer
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('created_at', 'total')
    ordering = ('-created_at',)

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'cancel']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        order = serializer.save()
        return Response({
            "success": True,
            "message": "Order created successfully",
            "data": OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status != Order.Status.PENDING:
            return Response({
                "success": False,
                "message": "Only pending orders can be cancelled."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        order.status = Order.Status.CANCELLED
        
        # Restore stock for each item
        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()
                
        order.save()
        return Response({
            "success": True,
            "message": "Order cancelled successfully",
            "data": OrderSerializer(order).data
        })


from rest_framework.views import APIView
from django.db.models import Sum
from products.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminStatsView(APIView):
    """API view to fetch dashboard statistics for administrators."""
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request, *args, **kwargs):
        total_revenue = Order.objects.filter(
            status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).aggregate(Sum('total'))['total__sum'] or 0.0

        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        total_customers = User.objects.filter(is_staff=False).count()

        return Response({
            "success": True,
            "message": "Admin stats retrieved successfully",
            "data": {
                "total_revenue": float(total_revenue),
                "total_orders": total_orders,
                "total_products": total_products,
                "total_customers": total_customers
            }
        })

