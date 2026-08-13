import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromCart, updateCartItem, clearCart } from '../../features/cart/cartSlice';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import { formatPrice } from '../../utils/helpers';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={() => window.location.href = '/products'}
          actionLabel="Start Shopping"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-display text-surface-900 mb-6">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border border-surface-200 rounded-2xl p-4">
              <Link to={`/products/${item.product?.slug || ''}`} className="w-24 h-24 bg-surface-100 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={item.product?.image || `https://placehold.co/100x100/e2e8f0/475569?text=Product`}
                  alt={item.product?.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?.slug || ''}`}>
                  <h3 className="text-sm font-medium text-surface-900 line-clamp-2">{item.product?.name}</h3>
                </Link>
                {item.product?.brand && (
                  <p className="text-xs text-surface-500 mt-0.5">{item.product.brand}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-base font-bold text-surface-900">
                    {formatPrice(item.product?.discount_price || item.product?.price)}
                  </span>
                  {item.product?.discount_price && (
                    <span className="text-xs text-surface-400 line-through">{formatPrice(item.product.price)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                      className="p-1.5 text-surface-600 hover:bg-surface-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))}
                      className="p-1.5 text-surface-600 hover:bg-surface-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="p-2 text-surface-400 hover:text-error-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-surface-200 rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-surface-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-surface-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-surface-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-success-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-surface-600">
              <span>Tax (18% GST)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <hr className="border-surface-200" />
            <div className="flex justify-between text-lg font-bold text-surface-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors mt-6"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
          {shipping > 0 && (
            <p className="text-xs text-surface-500 text-center mt-3">
              Add {formatPrice(499 - subtotal)} more for free shipping
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
