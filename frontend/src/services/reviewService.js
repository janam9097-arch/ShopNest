import api from './api';

const reviewService = {
  getProductReviews: (productId, params = {}) =>
    api.get(`/reviews/`, { params: { product: productId, ...params } }),
  createReview: (data) => api.post('/reviews/', data),
  updateReview: (reviewId, data) => api.patch(`/reviews/${reviewId}/`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}/`),
};

export default reviewService;
