from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'user', 'method', 'status', 'amount', 'created_at')
    list_filter = ('method', 'status', 'created_at')
    search_fields = ('order__order_number', 'user__email', 'stripe_payment_intent_id')
    readonly_fields = ('stripe_payment_intent_id', 'stripe_client_secret', 'transaction_id')
