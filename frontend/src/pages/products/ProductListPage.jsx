import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, setFilters, clearFilters, setCurrentPage } from '../../features/products/productSlice';
import { Star, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatPrice, calcDiscount } from '../../utils/helpers';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading, totalCount, totalPages, currentPage, filters } = useSelector(
    (state) => state.products
  );
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  useEffect(() => {
    const params = {
      page: currentPage,
      search: searchQuery || filters.search,
      category__slug: categoryParam || filters.category,
      brand: filters.brand,
      min_price: filters.min_price,
      max_price: filters.max_price,
      ordering: filters.ordering,
    };
    // Remove empty params
    const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
    dispatch(fetchProducts(cleaned));
  }, [dispatch, currentPage, filters, searchQuery, categoryParam]);

  const handleSort = (ordering) => {
    dispatch(setFilters({ ordering }));
    dispatch(setCurrentPage(1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-900">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-sm text-surface-500 mt-1">{totalCount} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filters.ordering}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 border border-surface-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="-created_at">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-avg_rating">Best Rated</option>
          </select>
          <div className="hidden sm:flex items-center border border-surface-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-surface-400'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-surface-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 px-3 py-2 border border-surface-200 rounded-xl text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} sm:block sm:relative sm:w-64 flex-shrink-0`}>
          {showFilters && (
            <div className="flex items-center justify-between mb-4 sm:hidden">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
          )}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-surface-900 mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={(e) => dispatch(setFilters({ min_price: e.target.value }))}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={(e) => dispatch(setFilters({ max_price: e.target.value }))}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-900 mb-3">Brand</h3>
              <input
                type="text"
                placeholder="Filter by brand"
                value={filters.brand}
                onChange={(e) => dispatch(setFilters({ brand: e.target.value }))}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={() => dispatch(clearFilters())}
              className="w-full py-2 text-sm text-error-600 border border-error-200 rounded-lg hover:bg-error-50 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" text="Loading products..." />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search terms."
              action={() => dispatch(clearFilters())}
              actionLabel="Clear Filters"
            />
          ) : (
            <>
              <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="group rounded-2xl border border-surface-200 overflow-hidden bg-white hover:shadow-card-hover transition-all duration-300"
                  >
                    <div className="aspect-square bg-surface-100 relative overflow-hidden">
                      <img
                        src={product.image || `https://placehold.co/400x400/e2e8f0/475569?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.discount_price && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-error-500 text-white text-xs font-bold rounded-lg">
                          -{calcDiscount(product.price, product.discount_price)}%
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      {product.brand && (
                        <p className="text-xs text-surface-500 uppercase tracking-wider">{product.brand}</p>
                      )}
                      <h3 className="text-sm font-medium text-surface-900 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < (product.avg_rating || 0) ? 'fill-accent-400 text-accent-400' : 'text-surface-300'}`} />
                        ))}
                        <span className="text-xs text-surface-500 ml-1">({product.review_count || 0})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-surface-900">
                          {formatPrice(product.discount_price || product.price)}
                        </span>
                        {product.discount_price && (
                          <span className="text-sm text-surface-400 line-through">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((page) => (
                    <button
                      key={page}
                      onClick={() => dispatch(setCurrentPage(page))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductListPage;
