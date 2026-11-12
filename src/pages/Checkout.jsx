import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, ArrowLeft, ShoppingBag, Lock, UserCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../services/dbBridge';
import { formatCurrency } from '../utils/formatters';

export const Checkout = () => {
  const { cart, subtotal, deliveryCharge, totalAmount, clearCart } = useCart();
  const { user, profile, isCustomerAuthenticated } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Customer form state
  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    orderNotes: ''
  });

  // Auto-fill customer details from profile if logged in
  useEffect(() => {
    if (isCustomerAuthenticated && profile) {
      setCustomer((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.name || '',
        phone: prev.phone || profile.phone || '',
        email: prev.email || user?.email || '',
        address: prev.address || profile.address || '',
        city: prev.city || profile.city || '',
        state: prev.state || profile.state || '',
        pincode: prev.pincode || profile.pincode || ''
      }));
    } else if (user?.email) {
      setCustomer((prev) => ({
        ...prev,
        email: prev.email || user.email
      }));
    }
  }, [isCustomerAuthenticated, profile, user]);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Your bag is empty</h2>
        <p className="text-xs text-muted">Please add products to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider"
        >
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validation
    if (!customer.fullName.trim()) {
      error('Full Name is required.');
      return;
    }
    const cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      error('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    if (!customer.address.trim()) {
      error('Delivery address is required.');
      return;
    }
    if (!customer.city.trim()) {
      error('City is required.');
      return;
    }
    if (!customer.state.trim()) {
      error('State is required.');
      return;
    }
    const cleanPin = customer.pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      error('Please enter a valid 6-digit Indian PIN Code.');
      return;
    }

    setSubmitting(true);

    try {
      // Map cart items into structured order items
      const orderItems = cart.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        variant: item.variant,
        variantType: item.variantType,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      // Create order in database (attaching user_id if logged in, null for guest)
      const createdOrder = await db.createOrder({
        user_id: user?.id || null,
        customer_name: customer.fullName.trim(),
        phone: cleanPhone,
        email: customer.email.trim() || null,
        address: customer.address.trim(),
        city: customer.city.trim(),
        state: customer.state.trim(),
        pincode: cleanPin,
        notes: customer.orderNotes.trim() || null,
        items: orderItems,
        subtotal,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount
      });

      // Clear cart
      clearCart();

      // Navigate to UPI QR Payment screen
      navigate(`/payment/${createdOrder.id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link to="/cart" className="hover:text-charcoal font-semibold flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Cart
        </Link>
        <span>/</span>
        <span className="text-charcoal font-bold uppercase tracking-wider">Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Shipping Form (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft space-y-6">
            <div className="border-b border-border-light pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-muted">
                  Step 1 of 2
                </span>
                <h1 className="font-serif text-2xl font-bold text-charcoal">
                  Delivery Details
                </h1>
                {isCustomerAuthenticated && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 mt-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Auto-filled from your saved account profile</span>
                  </p>
                )}
              </div>
              <Lock className="w-5 h-5 text-muted" />
            </div>

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    placeholder="e.g. Aryan Kedar"
                    className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Email Address (For Dispatch Receipt)
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                />
              </div>

              {/* Complete Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Flat, House No., Building, Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Detailed address with landmarks for courier navigation"
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl p-3 outline-none focus:border-charcoal transition-colors"
                />
              </div>

              {/* City, State, PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    placeholder="City"
                    className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    placeholder="State"
                    className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                    placeholder="6-digit PIN"
                    className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                  />
                </div>
              </div>

              {/* Order Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted block">
                  Delivery Notes / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={customer.orderNotes}
                  onChange={(e) => setCustomer({ ...customer, orderNotes: e.target.value })}
                  placeholder="e.g. Leave with security / Call upon arrival"
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Order Review & Pay CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-8 space-y-6 shadow-soft sticky top-28">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-border-light pb-4 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-muted font-normal">{cart.length} items</span>
            </h2>

            {/* Purchased Items List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-border-light/60 pr-1 space-y-2">
              {cart.map((item) => (
                <div key={item.key} className="pt-2 pb-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-cream border border-border-light shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-charcoal line-clamp-1">{item.name}</h4>
                      <span className="text-muted text-[11px]">
                        {item.variant ? `${item.variantType}: ${item.variant} &bull; ` : ''}Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-charcoal shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-border-light space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Tracked Express Courier</span>
                <span className="font-semibold text-charcoal">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(deliveryCharge)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>UPI Surcharge</span>
                <span className="font-bold text-emerald-700">₹0 (WAIVED)</span>
              </div>
              <div className="pt-3 border-t border-border-light flex justify-between text-base font-extrabold text-charcoal">
                <span>Total Payable Amount</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-charcoal text-white rounded-xl text-xs uppercase font-extrabold tracking-widest hover:bg-black transition-all shadow-md group disabled:bg-cream-300 disabled:text-muted"
            >
              <span>{submitting ? 'Generating Order...' : 'Place Order & Pay via UPI'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="space-y-2 text-[11px] text-muted text-center pt-2 border-t border-border-light">
              <p className="flex items-center justify-center gap-1.5 font-medium text-charcoal">
                <ShieldCheck className="w-4 h-4 text-accent" /> Step 2: Scan Dynamic UPI QR Code
              </p>
              <p>
                After clicking, you will be shown the store UPI QR code to transfer {formatCurrency(totalAmount)} and submit your 12-digit UPI reference ID.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

