import api from './api';

const orderService = {
  getOrders: (params = {}) => api.get('/orders/', { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  createOrder: (data) => api.post('/orders/', data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),
};

export default orderService;
