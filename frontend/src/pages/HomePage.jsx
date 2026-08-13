import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Headphones, RotateCcw, Star, TrendingUp, Zap, Percent } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent-500/20 text-accent-300 text-xs font-semibold rounded-full uppercase tracking-wider">
              <Zap className="w-3 h-3" /> New Season Collection
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-white leading-tight">
              Discover Premium <br />
              <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                Quality Products
              </span>
            </h1>
            <p className="text-lg text-primary-200 max-w-lg">
              Shop from our curated collection of products with unbeatable prices,
              fast delivery, and exceptional customer service.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-500 text-surface-900 font-semibold rounded-xl hover:bg-accent-400 transition-all hover:shadow-lg hover:shadow-accent-500/25"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?has_discount=true"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 backdrop-blur transition-all border border-white/10"
              >
                <Percent className="w-4 h-4" /> View Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'On orders above ₹499' },
              { icon: ShieldCheck, label: 'Secure Payment', desc: '100% secure checkout' },
              { icon: RotateCcw, label: 'Easy Returns', desc: '7-day return policy' },
              { icon: Headphones, label: '24/7 Support', desc: 'Dedicated assistance' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900">{item.label}</p>
                  <p className="text-xs text-surface-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-surface-900">
                Shop by Category
              </h2>
              <p className="text-surface-500 mt-1">Browse our popular categories</p>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books', 'Beauty'].map(
              (cat, i) => (
                <Link
                  key={i}
                  to={`/products?category=${cat.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-surface-100 to-surface-200 flex flex-col items-center justify-center p-4 hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{['📱', '👗', '🏠', '⚽', '📚', '💄'][i]}</span>
                  </div>
                  <span className="text-sm font-medium text-surface-800 text-center">{cat}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Trending Products Placeholder */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-error-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-error-500" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-surface-900">Trending Now</h2>
                <p className="text-surface-500 mt-0.5">Most popular products this week</p>
              </div>
            </div>
            <Link to="/products?ordering=-created_at" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-surface-200 overflow-hidden bg-white hover:shadow-card-hover transition-all duration-300 group">
                <div className="aspect-square bg-surface-100 relative overflow-hidden">
                  <img
                    src={`https://placehold.co/400x400/e2e8f0/475569?text=Product+${i + 1}`}
                    alt={`Product ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {i % 2 === 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-error-500 text-white text-xs font-bold rounded-lg">
                      -{20 + i * 5}%
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-surface-500 uppercase tracking-wider">Brand</p>
                  <h3 className="text-sm font-medium text-surface-900 line-clamp-2">
                    Premium Quality Product {i + 1}
                  </h3>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < 4 ? 'fill-accent-400 text-accent-400' : 'text-surface-300'}`} />
                    ))}
                    <span className="text-xs text-surface-500 ml-1">(42)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-surface-900">₹{(999 + i * 500).toLocaleString()}</span>
                    {i % 2 === 0 && (
                      <span className="text-sm text-surface-400 line-through">₹{(1499 + i * 500).toLocaleString()}</span>
                    )}
                  </div>
                  <button className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors mt-2">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-primary-800 p-8 sm:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl" />
            <div className="relative max-w-lg">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-4">
                Limited Time Offer
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-4">
                Up to 50% Off on Selected Items
              </h2>
              <p className="text-primary-200 mb-6">
                Don't miss out on our biggest sale of the season. Shop now and save big!
              </p>
              <Link
                to="/products?has_discount=true"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-accent-50 transition-colors"
              >
                Shop the Sale <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">
            Stay in the Loop
          </h2>
          <p className="text-surface-400 mb-8 max-w-md mx-auto">
            Subscribe to our newsletter for exclusive deals, new arrivals, and style tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white text-sm placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
