import django_filters
from django.db.models import Avg
from .models import Product

class ProductFilter(django_filters.FilterSet):
    """Custom product filter set."""
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    brand = django_filters.CharFilter(field_name="brand", lookup_expr='icontains')
    category = django_filters.CharFilter(field_name="category__slug")
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    has_discount = django_filters.BooleanFilter(method='filter_has_discount')
    rating = django_filters.NumberFilter(method='filter_by_rating')

    class Meta:
        model = Product
        fields = ['category', 'brand', 'min_price', 'max_price']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset

    def filter_has_discount(self, queryset, name, value):
        if value:
            return queryset.filter(discount_price__isnull=False)
        return queryset

    def filter_by_rating(self, queryset, name, value):
        if value:
            return queryset.annotate(avg_rating=Avg('reviews__rating')).filter(avg_rating__gte=value)
        return queryset
