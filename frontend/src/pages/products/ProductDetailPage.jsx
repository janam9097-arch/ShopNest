import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductBySlug, clearProduct } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, RotateCcw, ShieldCheck, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { formatPrice, calcDiscount, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import reviewService from '../../services/reviewService';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { product, isLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => dispatch(clearProduct());
  }, [dispatch, slug]);

  useEffect(() => {
    if (product?.id) {
      fetchReviews();
    }
  }, [product]);

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getProductReviews(product.id);
      setReviews(response.data.results || response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please write a comment.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await reviewService.createReview({
        product: product.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review. Make sure you purchased this product.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ product, quantity }));
    toast.success('Added to cart!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-surface-900">Product not found</h2>
        <Link to="/products" className="text-primary-600 mt-4 inline-block">Browse products</Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images.map((img) => img.image)
    : [product.image || `https://placehold.co/600x600/e2e8f0/475569?text=${encodeURIComponent(product.name)}`];

  const discount = calcDiscount(product.price, product.discount_price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-surface-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-surface-100 rounded-2xl overflow-hidden relative group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1.5 bg-error-500 text-white text-sm font-bold rounded-xl">
                -{discount}% OFF
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === i ? 'border-primary-500' : 'border-surface-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.brand && (
            <p className="text-sm text-primary-600 font-semibold uppercase tracking-wider">{product.brand}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-surface-900">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < (product.avg_rating || 0) ? 'fill-accent-400 text-accent-400' : 'text-surface-300'}`} />
              ))}
            </div>
            <span className="text-sm text-surface-500">({product.review_count || 0} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-surface-900">
              {formatPrice(product.discount_price || product.price)}
            </span>
            {product.discount_price && (
              <>
                <span className="text-lg text-surface-400 line-through">{formatPrice(product.price)}</span>
                <span className="px-2 py-1 bg-success-50 text-success-700 text-sm font-semibold rounded-lg">
                  Save {formatPrice(product.price - product.discount_price)}
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
            product.stock > 0 ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-success-500' : 'bg-error-500'}`} />
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-sm font-semibold text-surface-900 mb-2">Description</h3>
              <p className="text-sm text-surface-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity & Actions */}
          {product.stock > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-surface-700">Quantity:</span>
                <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-surface-600 hover:bg-surface-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 text-surface-600 hover:bg-surface-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button className="p-3.5 border border-surface-200 rounded-xl text-surface-600 hover:text-error-500 hover:border-error-200 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Delivery Info */}
          <div className="border-t border-surface-200 pt-6 space-y-3">
            {[
              { icon: Truck, label: 'Free delivery on orders above ₹499' },
              { icon: RotateCcw, label: '7-day easy returns' },
              { icon: ShieldCheck, label: 'Secure & safe payments' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-surface-600">
                <item.icon className="w-4 h-4 text-surface-400" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-surface-200 pt-10">
        <h2 className="text-2xl font-bold font-display text-surface-900 mb-8">Customer Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Distribution Snapshot */}
          <div className="space-y-4">
            <div className="bg-surface-50 p-6 rounded-2xl border border-surface-200">
              <p className="text-3xl font-extrabold text-surface-900">{product.avg_rating || 0.0}</p>
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (product.avg_rating || 0) ? 'fill-accent-400 text-accent-400' : 'text-surface-300'}`} />
                ))}
              </div>
              <p className="text-xs text-surface-500 mt-2">Based on {reviews.length} reviews</p>
            </div>

            {/* Write a Review Form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="bg-white border border-surface-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="font-bold text-surface-900">Share Your Experience</h3>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase mb-1">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase mb-1">Comment</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Describe your review of this product..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="bg-surface-50 p-6 rounded-2xl text-center border border-dashed border-surface-300">
                <p className="text-sm text-surface-600">Please log in to leave a review.</p>
                <Link to="/login" className="mt-3 inline-block px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg">Login Now</Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-surface-50 rounded-2xl p-8 text-center text-surface-500 border border-surface-150">
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-surface-900 text-sm">{r.user_name || 'Anonymous User'}</span>
                    <span className="text-xs text-surface-400">{formatDate(r.created_at)}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-accent-400 text-accent-400' : 'text-surface-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-surface-700 mt-2 leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
