from rest_framework import serializers
from django.db.models import Avg
from .models import Product, ProductImage
from categories.serializers import CategorySerializer

class ProductImageSerializer(serializers.ModelSerializer):
    """Product gallery image serializer."""
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary', 'order')


class ProductSerializer(serializers.ModelSerializer):
    """Product list serializer."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'description', 'category', 'category_name',
            'brand', 'price', 'discount_price', 'stock', 'sku', 'image',
            'is_active', 'avg_rating', 'review_count', 'created_at'
        )

    def get_avg_rating(self, obj):
        result = obj.reviews.aggregate(Avg('rating'))
        return round(result['rating__avg'] or 0.0, 1)

    def get_review_count(self, obj):
        return obj.reviews.count()


class ProductDetailSerializer(ProductSerializer):
    """Product detail serializer with full image gallery and categories details."""
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ('images',)
