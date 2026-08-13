import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronRight, Eye } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/');
      const data = response.data.results || response.data.data || response.data;
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          icon={Package}
          title="No orders placed yet"
          description="When you place your first order, it will appear here."
          action={() => window.location.href = '/products'}
          actionLabel="Start Shopping"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-900">My Orders</h1>
          <p className="text-sm text-surface-500 mt-1">Manage and track your orders</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface-50 border-b border-surface-200 text-sm">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div>
                  <p className="text-xs text-surface-500 uppercase font-semibold">Order Placed</p>
                  <p className="font-medium text-surface-800 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 uppercase font-semibold">Total Cost</p>
                  <p className="font-semibold text-surface-900 mt-0.5">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 uppercase font-semibold">Order ID</p>
                  <p className="font-medium text-surface-800 mt-0.5 truncate max-w-[120px]">{order.order_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-center">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Eye className="w-4 h-4" /> View Details
                </Link>
              </div>
            </div>

            {/* Order Items snapshot */}
            <div className="p-4 space-y-4">
              {order.items?.slice(0, 2).map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-12 h-12 bg-surface-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.product_image || 'https://placehold.co/100x100'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-surface-900 truncate">{item.product_name}</h4>
                    <p className="text-xs text-surface-500 mt-0.5">Qty: {item.quantity} • {formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
              {order.items?.length > 2 && (
                <p className="text-xs text-surface-500 font-medium pl-1">
                  + {order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
