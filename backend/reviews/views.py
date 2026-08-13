from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review
from .serializers import ReviewSerializer
from orders.models import OrderItem

class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for managing product reviews with purchase verification."""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('product',)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        user = request.user
        product_id = request.data.get('product')

        if not product_id:
            return Response({
                "success": False,
                "message": "product ID is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 1. Check if user already reviewed this product
        if Review.objects.filter(user=user, product_id=product_id).exists():
            return Response({
                "success": False,
                "message": "You have already reviewed this product."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 2. Purchase Verification: check if user purchased this product
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            order__payment_status='paid', # Must have paid for the order
            product_id=product_id
        ).exists()

        if not has_purchased:
            return Response({
                "success": False,
                "message": "You can only review products you have purchased."
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(user=user)
        return Response({
            "success": True,
            "message": "Review added successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({
                "success": False,
                "message": "You can only edit your own reviews."
            }, status=status.HTTP_403_FORBIDDEN)
            
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "Review updated successfully",
            "data": serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({
                "success": False,
                "message": "You can only delete your own reviews."
            }, status=status.HTTP_403_FORBIDDEN)
            
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "Review deleted successfully"
        })
