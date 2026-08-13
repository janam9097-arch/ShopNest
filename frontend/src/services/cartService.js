import api from './api';

const cartService = {
  getCart: () => api.get('/cart/'),
  addItem: (productId, quantity = 1) =>
    api.post('/cart/items/', { product_id: productId, quantity }),
  updateItem: (itemId, quantity) =>
    api.patch(`/cart/items/${itemId}/`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}/`),
  clearCart: () => api.delete('/cart/clear/'),
  applyCoupon: (code) => api.post('/cart/apply-coupon/', { code }),
};

export default cartService;
