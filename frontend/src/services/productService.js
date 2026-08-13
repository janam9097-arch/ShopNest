import api from './api';

const productService = {
  getProducts: (params = {}) => api.get('/products/', { params }),
  getProductBySlug: (slug) => api.get(`/products/${slug}/`),
  getCategories: () => api.get('/categories/'),
  searchProducts: (query) => api.get('/products/', { params: { search: query, page_size: 5 } }),
  getFeaturedProducts: () => api.get('/products/', { params: { ordering: '-created_at', page_size: 8 } }),
  getBestSellers: () => api.get('/products/', { params: { ordering: '-sold_count', page_size: 8 } }),
  getDiscountedProducts: () => api.get('/products/', { params: { has_discount: true, page_size: 8 } }),
};

export default productService;
