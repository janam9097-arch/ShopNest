import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../features/cart/cartSlice';
import { createOrder } from '../../features/orders/orderSlice';
import api from '../../services/api';
import {
  MapPin,
  Package,
  CreditCard,
  CheckCircle,
  Truck,
  Plus,
  Trash2,
  ChevronRight,
  ArrowRight,
  Shield,
  Loader2,
} from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);

  // Address form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses/');
      const data = response.data.results || response.data.data || response.data;
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find((a) => a.is_default);
        setSelectedAddress(defaultAddr || data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/addresses/', {
        full_name: fullName,
        phone,
        address_line: addressLine,
        city,
        state,
        postal_code: postalCode,
        country,
      });
      toast.success('Address added successfully!');
      fetchAddresses();
      setShowAddressForm(false);
      // Reset form
      setFullName('');
      setPhone('');
      setAddressLine('');
      setCity('');
      setState('');
      setPostalCode('');
    } catch (err) {
      toast.error('Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/addresses/${id}/`);
      toast.success('Address deleted.');
      fetchAddresses();
      if (selectedAddress?.id === id) {
        setSelectedAddress(null);
      }
    } catch (err) {
      toast.error('Failed to delete address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create the order on backend
      const orderRes = await api.post('/orders/', {
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
      });

      const order = orderRes.data.data;

      // 2. Create the payment record/intent
      const paymentRes = await api.post('/payments/create-intent/', {
        order_id: order.id,
        method: paymentMethod,
      });

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully (Cash on Delivery)!');
        setCreatedOrderData(order);
        dispatch(clearCart());
        setStep(4);
      } else {
        // Stripe Payment Flow Simulation
        const { clientSecret, paymentIntentId, isMock } = paymentRes.data.data;
        toast.loading('Processing payment...');
        
        setTimeout(async () => {
          toast.dismiss();
          try {
            // Confirm the mock or actual payment
            const confirmRes = await api.post('/payments/confirm/', {
              payment_intent_id: paymentIntentId,
              status: 'succeeded',
            });
            
            toast.success('Payment successful! Order confirmed.');
            setCreatedOrderData(order);
            dispatch(clearCart());
            setStep(4);
          } catch (err) {
            toast.error('Payment confirmation failed.');
          }
        }, 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && step < 4) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <Link to="/products" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors inline-block">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Checkout Steps */}
      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        {[
          { id: 1, label: 'Address', icon: MapPin },
          { id: 2, label: 'Summary', icon: Package },
          { id: 3, label: 'Payment', icon: CreditCard },
          { id: 4, label: 'Confirm', icon: CheckCircle },
        ].map((s) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-initial">
            <div className={`flex items-center gap-2 ${step >= s.id ? 'text-primary-600' : 'text-surface-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step >= s.id ? 'border-primary-600 bg-primary-50 text-primary-600 font-bold' : 'border-surface-200 text-surface-400'
              }`}>
                {step > s.id ? <CheckCircle className="w-5 h-5 fill-primary-600 text-white" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className="text-sm font-semibold hidden sm:block">{s.label}</span>
            </div>
            {s.id < 4 && (
              <div className={`flex-1 h-0.5 mx-4 ${step > s.id ? 'bg-primary-600' : 'bg-surface-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address Selection */}
          {step === 1 && (
            <div className="bg-white border border-surface-200 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-surface-900">Select Shipping Address</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-surface-100 bg-surface-50 p-4 rounded-xl">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-surface-500 uppercase mb-1">Full Name</label>
                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase mb-1">Phone Number</label>
                    <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase mb-1">Postal Code</label>
                    <input required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white" placeholder="560001" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-surface-500 uppercase mb-1">Address line</label>
                    <input required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white" placeholder="Flat, House no, Building, Street" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase mb-1">City</label>
                    <input required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white" placeholder="Bengaluru" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase mb-1">State</label>
                    <input required value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white" placeholder="Karnataka" />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 border border-surface-200 text-sm font-semibold rounded-lg hover:bg-surface-100">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700">Save Address</button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <p className="text-sm text-surface-500 text-center py-6">No saved addresses. Please add a new address.</p>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`flex gap-3 items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddress?.id === addr.id
                          ? 'border-primary-500 bg-primary-50/20'
                          : 'border-surface-200 hover:border-surface-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => setSelectedAddress(addr)}
                        className="mt-1 accent-primary-600"
                      />
                      <div className="flex-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-surface-900">{addr.full_name}</span>
                          {addr.is_default && (
                            <span className="px-2 py-0.5 bg-surface-100 text-surface-600 text-[10px] rounded font-medium">Default</span>
                          )}
                        </div>
                        <p className="text-surface-600 mt-1">{addr.address_line}</p>
                        <p className="text-surface-600">{addr.city}, {addr.state} - {addr.postal_code}</p>
                        <p className="text-surface-500 mt-1 font-medium">{addr.phone}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(addr.id);
                        }}
                        className="text-surface-400 hover:text-error-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {selectedAddress && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Deliver to this Address <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Step 2: Order Summary */}
          {step === 2 && (
            <div className="bg-white border border-surface-200 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-surface-900">Review Order Details</h2>

              {/* Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-surface-100 pb-4 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-surface-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.product?.image || 'https://placehold.co/100x100'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-surface-900 truncate">{item.product?.name}</h3>
                      <p className="text-xs text-surface-500 mt-0.5">Quantity: {item.quantity}</p>
                      <p className="text-sm font-bold text-surface-900 mt-1">{formatPrice((item.product?.discount_price || item.product?.price) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address Snapshot */}
              <div className="bg-surface-50 p-4 rounded-xl border border-surface-150">
                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Shipping to</h3>
                <p className="text-sm font-semibold text-surface-900">{selectedAddress?.full_name}</p>
                <p className="text-sm text-surface-600 mt-1">{selectedAddress?.address_line}</p>
                <p className="text-sm text-surface-600">{selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.postal_code}</p>
                <p className="text-sm text-surface-500 mt-1">{selectedAddress?.phone}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-surface-200 font-semibold rounded-xl hover:bg-surface-50 text-surface-700 transition-colors">
                  Change Address
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === 3 && (
            <div className="bg-white border border-surface-200 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-surface-900">Select Payment Method</h2>

              <div className="space-y-4">
                {/* Stripe */}
                <div
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-primary-500 bg-primary-50/20'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <input type="radio" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="mt-1 accent-primary-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                      Card Payment (Stripe) <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] rounded font-medium">Fast & Secure</span>
                    </p>
                    <p className="text-xs text-surface-500 mt-1">Pay with Credit/Debit cards safely via secure checkout.</p>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-primary-500 bg-primary-50/20'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1 accent-primary-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-surface-900">Cash on Delivery (COD)</p>
                    <p className="text-xs text-surface-500 mt-1">Pay with cash when your package is delivered.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-surface-200 font-semibold rounded-xl hover:bg-surface-50 text-surface-700 transition-colors">
                  Back to Summary
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && createdOrderData && (
            <div className="bg-white border border-surface-200 rounded-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-success-50 text-success-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 fill-success-600 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-surface-900">Thank you for your order!</h1>
                <p className="text-sm text-surface-500">Your order has been placed successfully.</p>
                <p className="text-sm font-semibold text-surface-700">Order Number: {createdOrderData.order_number}</p>
              </div>

              <div className="border border-surface-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-3 bg-surface-50 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">Total Paid:</span>
                  <span className="font-bold text-surface-900">{formatPrice(createdOrderData.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Payment Status:</span>
                  <span className="px-2 py-0.5 bg-success-50 text-success-700 text-xs font-semibold rounded uppercase">
                    {createdOrderData.payment_method === 'cod' ? 'Pending (COD)' : 'Paid'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Delivery Est:</span>
                  <span className="font-medium text-surface-800">4-6 Business Days</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto pt-2">
                <Link to="/orders" className="flex-1 py-3 border border-surface-200 font-semibold rounded-xl hover:bg-surface-50 text-surface-700 text-sm text-center">
                  View My Orders
                </Link>
                <Link to="/products" className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 text-sm text-center">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Sticky Summary */}
        {step < 4 && (
          <div className="bg-white border border-surface-200 rounded-2xl p-6 h-fit sticky top-24 space-y-4">
            <h3 className="text-base font-bold text-surface-900">Order Totals</h3>
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
              <hr className="border-surface-150" />
              <div className="flex justify-between text-lg font-bold text-surface-900">
                <span>Grand Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-150 space-y-2.5">
              <div className="flex gap-2.5 items-center text-xs text-surface-500">
                <Shield className="w-4 h-4 text-success-600 flex-shrink-0" />
                <span>Secure Payments powered by ShopNest. Your details are safe with us.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
