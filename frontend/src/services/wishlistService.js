import api from './api';

const wishlistService = {
  getWishlist: () => api.get('/wishlist/'),
  addItem: (productId) => api.post('/wishlist/items/', { product_id: productId }),
  removeItem: (itemId) => api.delete(`/wishlist/items/${itemId}/`),
  moveToCart: (itemId) => api.post(`/wishlist/items/${itemId}/move-to-cart/`),
};

export default wishlistService;
