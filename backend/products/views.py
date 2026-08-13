from rest_framework import viewsets, permissions, filters
from django.db.models import Avg
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product
from .serializers import ProductSerializer, ProductDetailSerializer
from .filters import ProductFilter

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving products."""
    queryset = Product.objects.filter(is_active=True)
    permission_classes = (permissions.AllowAny,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = ProductFilter
    search_fields = ('name', 'description', 'brand', 'sku')
    ordering_fields = ('price', 'created_at', 'avg_rating')
    ordering = ('-created_at',)
    lookup_field = 'slug'

    def get_queryset(self):
        # Annotate queryset with avg_rating for sorting
        return super().get_queryset().annotate(
            annotated_avg_rating=Avg('reviews__rating')
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
