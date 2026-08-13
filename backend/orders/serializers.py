from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem
from products.models import Product
from cart.models import Cart
from users.serializers import AddressSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    """Order item serializer."""
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_image', 'price', 'quantity', 'subtotal')
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    """Order serializer containing list of items, address, and total costs."""
    items = OrderItemSerializer(many=True, read_only=True)
    address_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'status', 'payment_status', 'payment_method',
            'subtotal', 'discount', 'shipping_cost', 'tax', 'total',
            'shipping_address', 'items', 'notes', 'tracking_number',
            'estimated_delivery', 'address_id', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'order_number', 'status', 'payment_status',
            'subtotal', 'discount', 'shipping_cost', 'tax', 'total',
            'shipping_address', 'tracking_number', 'estimated_delivery',
            'created_at', 'updated_at'
        )

    def create(self, validated_data):
        user = self.context['request'].user
        address_id = validated_data.pop('address_id', None)
        payment_method = validated_data.get('payment_method', 'cod')
        notes = validated_data.get('notes', '')

        # Get shipping address from user addresses list
        if address_id:
            from users.models import Address
            try:
                addr = Address.objects.get(id=address_id, user=user)
                shipping_address = {
                    "full_name": addr.full_name,
                    "phone": addr.phone,
                    "address_line": addr.address_line,
                    "city": addr.city,
                    "state": addr.state,
                    "postal_code": addr.postal_code,
                    "country": addr.country
                }
            except Address.DoesNotExist:
                raise serializers.ValidationError({"address_id": "Address not found."})
        else:
            # Check if there is a default address
            from users.models import Address
            addr = Address.objects.filter(user=user, is_default=True).first()
            if not addr:
                addr = Address.objects.filter(user=user).first()
            if not addr:
                raise serializers.ValidationError({"address_id": "Shipping address is required."})
            
            shipping_address = {
                "full_name": addr.full_name,
                "phone": addr.phone,
                "address_line": addr.address_line,
                "city": addr.city,
                "state": addr.state,
                "postal_code": addr.postal_code,
                "country": addr.country
            }

        # Get user cart
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise serializers.ValidationError("Cart is empty.")

        cart_items = cart.items.all()
        if not cart_items.exists():
            raise serializers.ValidationError("Cart is empty.")

        # Perform atomic database operations
        with transaction.atomic():
            subtotal = 0
            order_items_to_create = []

            # Check stock and compile totals
            for item in cart_items:
                product = item.product
                if product.stock < item.quantity:
                    raise serializers.ValidationError(
                        f"Insufficient stock for {product.name}. Only {product.stock} available."
                    )
                
                # Reduce stock
                product.stock -= item.quantity
                product.save()

                item_price = product.effective_price
                item_subtotal = item_price * item.quantity
                subtotal += item_subtotal

                # Prepare OrderItem mapping
                order_item = OrderItem(
                    product=product,
                    product_name=product.name,
                    product_image=product.image.url if product.image else '',
                    price=item_price,
                    quantity=item.quantity,
                    subtotal=item_subtotal
                )
                order_items_to_create.append(order_item)

            # Calculate total costs
            shipping_cost = 0 if subtotal > 499 else 49
            tax = round(subtotal * 0.18, 2)  # 18% GST
            total = subtotal + shipping_cost + tax

            # Create Order
            order = Order.objects.create(
                user=user,
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                tax=tax,
                total=total,
                shipping_address=shipping_address,
                payment_method=payment_method,
                notes=notes
            )

            # Save Order Items linked to order
            for order_item in order_items_to_create:
                order_item.order = order
                order_item.save()

            # Clear cart
            cart_items.delete()

            return order
