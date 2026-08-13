import React, { useState, useEffect } from 'react';
import { BarChart3, Package, ShoppingCart, Users, DollarSign, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/admin/stats/');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: stats ? formatPrice(stats.total_revenue) : '₹0.00', icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: stats ? stats.total_orders.toString() : '0', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Products', value: stats ? stats.total_products.toString() : '0', icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Customers', value: stats ? stats.total_customers.toString() : '0', icon: Users, color: 'bg-orange-50 text-orange-600' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-900">Admin Dashboard</h1>
          <p className="text-surface-500 mt-1">Overview of your store performance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white border border-surface-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-surface-900 mt-3">{stat.value}</p>
            <p className="text-sm text-surface-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Manage Products', to: '/admin/products', icon: Package, color: 'text-primary-600' },
          { label: 'Manage Orders', to: '/admin/orders', icon: ShoppingCart, color: 'text-blue-600' },
          { label: 'Manage Categories', to: '/admin/categories', icon: BarChart3, color: 'text-purple-600' },
          { label: 'Manage Users', to: '/admin/users', icon: Users, color: 'text-orange-600' },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className="flex items-center gap-3 p-4 bg-white border border-surface-200 rounded-2xl hover:shadow-card-hover transition-all"
          >
            <action.icon className={`w-5 h-5 ${action.color}`} />
            <span className="text-sm font-medium text-surface-900">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
