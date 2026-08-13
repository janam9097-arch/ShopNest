from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer

class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user cart and cart items."""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_cart(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def list(self, request, *args, **kwargs):
        cart = self.get_cart()
        serializer = self.get_serializer(cart)
        return Response({
            "success": True,
            "message": "Cart retrieved successfully",
            "data": serializer.data
        })

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear(self, request):
        cart = self.get_cart()
        cart.items.all().delete()
        return Response({
            "success": True,
            "message": "Cart cleared successfully"
        }, status=status.HTTP_200_OK)


class CartItemViewSet(viewsets.ModelViewSet):
    """ViewSet for individual cart item operations."""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

    def get_cart(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def create(self, request, *args, **kwargs):
        cart = self.get_cart()
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)

        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # Update quantity instead of duplicate entries
            cart_item.quantity += quantity
            # Revalidate stock limit
            if product.stock < cart_item.quantity:
                return Response({
                    "success": False,
                    "message": "Insufficient stock",
                    "errors": {"quantity": [f"Only {product.stock} items available in stock."]}
                }, status=status.HTTP_400_BAD_REQUEST)
            cart_item.save()

        cart_serializer = CartSerializer(cart)
        return Response({
            "success": True,
            "message": "Item added to cart successfully",
            "data": cart_serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_update(serializer)
        cart_serializer = CartSerializer(instance.cart)
        return Response({
            "success": True,
            "message": "Cart item updated successfully",
            "data": cart_serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        cart = instance.cart
        self.perform_destroy(instance)
        cart_serializer = CartSerializer(cart)
        return Response({
            "success": True,
            "message": "Cart item removed successfully",
            "data": cart_serializer.data
        })
