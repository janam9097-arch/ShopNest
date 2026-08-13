from django.urls import path
from .views import CreatePaymentIntentView, ConfirmPaymentView

urlpatterns = [
    path('create-intent/', CreatePaymentIntentView.as_view(), name='create_payment_intent'),
    path('confirm/', ConfirmPaymentView.as_view(), name='confirm_payment'),
]
