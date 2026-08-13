from rest_framework import serializers
from .models import Wishlist, WishlistItem
from products.serializers import ProductSerializer
from products.models import Product

class WishlistItemSerializer(serializers.ModelSerializer):
    """Wishlist item serializer."""
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True
    )

    class Meta:
        model = WishlistItem
        fields = ('id', 'product', 'product_id', 'created_at')


class WishlistSerializer(serializers.ModelSerializer):
    """Wishlist serializer."""
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'user', 'items', 'total_items', 'created_at', 'updated_at')
