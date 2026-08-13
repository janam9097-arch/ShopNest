from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer, WishlistItemSerializer
from cart.models import Cart, CartItem
from cart.serializers import CartSerializer

class WishlistViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user wishlist."""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def get_wishlist(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

    def list(self, request, *args, **kwargs):
        wishlist = self.get_wishlist()
        serializer = self.get_serializer(wishlist)
        return Response({
            "success": True,
            "message": "Wishlist retrieved successfully",
            "data": serializer.data
        })


class WishlistItemViewSet(viewsets.ModelViewSet):
    """ViewSet for wishlist item CRUD and move-to-cart action."""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = WishlistItemSerializer

    def get_queryset(self):
        return WishlistItem.objects.filter(wishlist__user=self.request.user)

    def get_wishlist(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

    def create(self, request, *args, **kwargs):
        wishlist = self.get_wishlist()
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        product = serializer.validated_data['product']

        # Add to wishlist, prevent duplicate entries
        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            product=product
        )
        
        wishlist_serializer = WishlistSerializer(wishlist)
        return Response({
            "success": True,
            "message": "Product added to wishlist successfully",
            "data": wishlist_serializer.data
        }, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        wishlist = instance.wishlist
        self.perform_destroy(instance)
        wishlist_serializer = WishlistSerializer(wishlist)
        return Response({
            "success": True,
            "message": "Product removed from wishlist successfully",
            "data": wishlist_serializer.data
        })

    @action(detail=True, methods=['post'], url_path='move-to-cart')
    def move_to_cart(self, request, pk=None):
        instance = self.get_object()
        wishlist = instance.wishlist
        product = instance.product
        
        # Add to user cart
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 1}
        )
        
        if not created:
            cart_item.quantity += 1
            cart_item.save()
            
        # Delete from wishlist
        instance.delete()
        
        wishlist_serializer = WishlistSerializer(wishlist)
        cart_serializer = CartSerializer(cart)
        
        return Response({
            "success": True,
            "message": "Moved item to cart",
            "data": {
                "wishlist": wishlist_serializer.data,
                "cart": cart_serializer.data
            }
        }, status=status.HTTP_200_OK)
