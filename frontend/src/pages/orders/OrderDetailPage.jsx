import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ChevronLeft,
  XCircle,
  Truck,
  CheckCircle,
  Clock,
  Settings,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { formatPrice, formatDate, getStatusColor, getPaymentStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ORDER_STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Settings },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const response = await api.get(`/orders/${id}/`);
      const data = response.data.data || response.data;
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(true);
    try {
      await api.post(`/orders/${id}/cancel/`);
      toast.success('Order cancelled successfully.');
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <ErrorMessage message={error || 'Order not found.'} />
        <Link to="/orders" className="text-primary-600 font-semibold mt-4 block flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  // Calculate current progress index in status steps
  const isSpecialStatus = ['cancelled', 'returned'].includes(order.status);
  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/orders" className="text-sm font-semibold text-surface-600 hover:text-primary-600 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to My Orders
        </Link>
        {order.status === 'pending' && (
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="px-4 py-2 text-sm font-semibold text-error-600 border border-error-200 rounded-xl hover:bg-error-50 disabled:opacity-50 flex items-center gap-1.5 self-start sm:self-center"
          >
            <XCircle className="w-4 h-4" /> Cancel Order
          </button>
        )}
      </div>

      {/* Header Info */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-surface-900">Order ID: {order.order_number}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-surface-500">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(order.created_at)}</span>
            <span>•</span>
            <span>Payment: <strong className="uppercase">{order.payment_method}</strong></span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider ${getStatusColor(order.status)}`}>
            Status: {order.status.replace(/_/g, ' ')}
          </span>
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider ${getPaymentStatusColor(order.payment_status)}`}>
            Payment: {order.payment_status}
          </span>
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      {!isSpecialStatus && (
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-surface-900 mb-6">Tracking Status</h3>
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-y-4 md:gap-y-0 relative">
            {ORDER_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.key} className="flex md:flex-col items-center flex-1 last:flex-initial relative">
                  <div className="flex items-center md:flex-col gap-3 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                        : 'border-surface-200 bg-white text-surface-400'
                    } ${isCurrent ? 'ring-4 ring-primary-100 animate-pulse' : ''}`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left md:text-center">
                      <p className={`text-sm font-semibold ${isCompleted ? 'text-surface-900' : 'text-surface-400'}`}>{step.label}</p>
                      {isCurrent && <p className="text-[10px] text-primary-600 font-semibold uppercase tracking-wider mt-0.5">Active</p>}
                    </div>
                  </div>
                  {/* Connecting Line */}
                  {idx < ORDER_STEPS.length - 1 && (
                    <div className={`hidden md:block absolute top-5 left-[50%] right-[-50%] h-0.5 -z-10 ${
                      currentStepIndex > idx ? 'bg-primary-600' : 'bg-surface-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isSpecialStatus && (
        <div className="bg-error-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <XCircle className="w-10 h-10 text-error-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 uppercase">Order {order.status}</h3>
            <p className="text-sm text-red-700 mt-1">
              This order has been {order.status}. Stock items have been restored and payment status has been adjusted accordingly.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-surface-900 mb-2">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-surface-100 pb-4 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-surface-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.product_image || 'https://placehold.co/100x100'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-surface-900 truncate">{item.product_name}</h4>
                    <p className="text-xs text-surface-500 mt-0.5">Price: {formatPrice(item.price)} • Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-surface-900 mt-1">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-3 text-sm">
            <h3 className="text-base font-bold text-surface-900">Shipping Address</h3>
            <div>
              <p className="font-semibold text-surface-900">{order.shipping_address?.full_name}</p>
              <p className="text-surface-600 mt-1">{order.shipping_address?.address_line}</p>
              <p className="text-surface-600">{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code}</p>
              <p className="text-surface-600">{order.shipping_address?.country}</p>
              <p className="text-surface-500 mt-2 font-medium">Phone: {order.shipping_address?.phone}</p>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-4 text-sm">
            <h3 className="text-base font-bold text-surface-900">Cost Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>Shipping</span>
                <span>{order.shipping_cost === 0 ? <span className="text-success-600 font-semibold">FREE</span> : formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>Tax (18% GST)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <hr className="border-surface-150" />
              <div className="flex justify-between text-base font-bold text-surface-900">
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
