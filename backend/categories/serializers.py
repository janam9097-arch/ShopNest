from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    """Category serializer."""
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'image', 'is_active', 'created_at')
