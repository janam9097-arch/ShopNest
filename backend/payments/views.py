from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from orders.models import Order
from .models import Payment
import stripe
import uuid

class CreatePaymentIntentView(APIView):
    """API view to create Stripe Payment Intent or Cash on Delivery record."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        method = request.data.get('method', 'stripe')

        if not order_id:
            return Response({
                "success": False,
                "message": "order_id is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({
                "success": False,
                "message": "Order not found."
            }, status=status.HTTP_404_NOT_FOUND)

        if method == 'cod':
            # Handle Cash on Delivery
            payment, created = Payment.objects.get_or_create(
                order=order,
                user=request.user,
                defaults={
                    'method': Payment.Method.COD,
                    'status': Payment.Status.PENDING,
                    'amount': order.total
                }
            )
            order.payment_status = Order.PaymentStatus.PENDING
            order.save()
            return Response({
                "success": True,
                "message": "COD payment recorded.",
                "data": {
                    "payment_id": str(payment.id),
                    "method": "cod",
                    "status": "pending"
                }
            })

        # Handle Stripe Payment
        amount_in_cents = int(order.total * 100)
        stripe_secret = getattr(settings, 'STRIPE_SECRET_KEY', '')

        # Fallback for development if no Stripe key is configured
        if not stripe_secret or stripe_secret.startswith('sk_test_your-stripe'):
            # Mock Stripe Response for zero-friction local development
            payment, created = Payment.objects.get_or_create(
                order=order,
                user=request.user,
                defaults={
                    'method': Payment.Method.STRIPE,
                    'status': Payment.Status.PENDING,
                    'amount': order.total,
                    'stripe_payment_intent_id': f'pi_mock_{uuid.uuid4().hex[:16]}',
                    'stripe_client_secret': f'pi_mock_secret_{uuid.uuid4().hex[:32]}'
                }
            )
            return Response({
                "success": True,
                "message": "Mock Payment Intent created successfully (Stripe not configured).",
                "data": {
                    "clientSecret": payment.stripe_client_secret,
                    "paymentIntentId": payment.stripe_payment_intent_id,
                    "isMock": True,
                    "amount": float(payment.amount)
                }
            })

        try:
            stripe.api_key = stripe_secret
            # Create Stripe Payment Intent
            intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency='inr',
                metadata={'order_id': str(order.id), 'user_email': request.user.email}
            )
            
            payment, created = Payment.objects.get_or_create(
                order=order,
                user=request.user,
                defaults={
                    'method': Payment.Method.STRIPE,
                    'status': Payment.Status.PENDING,
                    'amount': order.total,
                    'stripe_payment_intent_id': intent['id'],
                    'stripe_client_secret': intent['client_secret']
                }
            )

            return Response({
                "success": True,
                "message": "Payment Intent created successfully.",
                "data": {
                    "clientSecret": intent['client_secret'],
                    "paymentIntentId": intent['id'],
                    "isMock": False,
                    "amount": float(payment.amount)
                }
            })
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Stripe Error: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)


class ConfirmPaymentView(APIView):
    """View to confirm payment and update order status."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        payment_intent_id = request.data.get('payment_intent_id')
        status_param = request.data.get('status') # 'succeeded' or 'failed'

        if not payment_intent_id:
            return Response({
                "success": False,
                "message": "payment_intent_id is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({
                "success": False,
                "message": "Payment record not found."
            }, status=status.HTTP_404_NOT_FOUND)

        if status_param == 'succeeded':
            payment.status = Payment.Status.COMPLETED
            payment.order.payment_status = Order.PaymentStatus.PAID
            payment.order.status = Order.Status.CONFIRMED
            payment.order.save()
            payment.save()
            return Response({
                "success": True,
                "message": "Payment confirmed and order placed.",
                "data": {
                    "order_number": payment.order.order_number,
                    "payment_status": "paid"
                }
            })
        else:
            payment.status = Payment.Status.FAILED
            payment.order.payment_status = Order.PaymentStatus.FAILED
            payment.order.save()
            payment.save()
            return Response({
                "success": False,
                "message": "Payment failed.",
                "data": {
                    "order_number": payment.order.order_number,
                    "payment_status": "failed"
                }
            })
