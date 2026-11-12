import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const Cart = () => {
  const {
    cart,
    itemCount,
    subtotal,
    deliveryCharge,
    totalAmount,
    isFreeDelivery,
    freeDeliveryThreshold,
    freeDeliveryShortfall,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center text-muted mx-auto shadow-soft">
          <ShoppingBag className="w-10 h-10 opacity-40" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            You haven&rsquo;t added any limited edition wall art or precision die-cast collectibles to your cart yet.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-charcoal text-white rounded-xl text-xs uppercase font-extrabold tracking-wider hover:bg-black transition-colors shadow-md"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border-light">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-muted">
            Checkout Preparation
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-charcoal mt-1">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-muted hover:text-red-600 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Shipping Alert Bar */}
          <div className="bg-white rounded-2xl p-4 border border-border-light shadow-soft space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent" />
                {isFreeDelivery ? (
                  <span className="text-emerald-700 font-bold">You qualify for FREE Express Shipping!</span>
                ) : (
                  <span>
                    Add <strong className="text-charcoal">{formatCurrency(freeDeliveryShortfall)}</strong> more for FREE Shipping!
                  </span>
                )}
              </span>
              <span>{Math.round(freeDeliveryProgress)}%</span>
            </div>
            <div className="w-full bg-cream-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-charcoal h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl border border-border-light divide-y divide-border-light shadow-soft overflow-hidden">
            {cart.map((item) => (
              <div key={item.key} className="p-6 flex flex-col sm:flex-row gap-6 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl bg-cream border border-border-light shrink-0"
                />

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted">
                        {item.category === 'posters' ? 'Poster' : `Die-Cast / ${item.brand || 'Model'}`}
                      </span>
                      <h3 className="font-serif font-bold text-base text-charcoal">
                        {item.name}
                      </h3>
                      {item.variant && (
                        <span className="inline-block px-2.5 py-0.5 bg-cream-100 text-charcoal text-[11px] font-semibold rounded-md border border-border-light mt-1">
                          {item.variantType || 'Variant'}: {item.variant}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="p-1.5 text-muted hover:text-red-600 transition-colors self-center sm:self-start"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-light/60">
                    {/* Quantity */}
                    <div className="flex items-center border border-border-light rounded-xl bg-cream-50 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="px-2 font-bold text-charcoal hover:opacity-70"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="px-2 font-bold text-charcoal hover:opacity-70"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted block sm:inline mr-2">
                        {formatCurrency(item.price)} each
                      </span>
                      <span className="font-serif font-extrabold text-base text-charcoal">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal hover:underline pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-8 space-y-6 shadow-soft sticky top-28">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-border-light pb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-charcoal">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Pan-India Delivery</span>
                <span className="font-semibold text-charcoal">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(deliveryCharge)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>UPI Processing Surcharge</span>
                <span className="font-bold text-emerald-700">₹0 (WAIVED)</span>
              </div>

              <div className="pt-4 border-t border-border-light flex justify-between text-base font-extrabold text-charcoal">
                <span>Total Amount</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-charcoal text-white rounded-xl text-xs uppercase font-extrabold tracking-widest hover:bg-black transition-all shadow-md group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="space-y-2 pt-2 text-[11px] text-muted text-center border-t border-border-light">
              <p className="flex items-center justify-center gap-1.5 font-medium text-charcoal">
                <ShieldCheck className="w-4 h-4 text-accent" /> Direct Manual UPI QR Payment
              </p>
              <p>You will pay via UPI in the next step and submit your 12-digit transaction ID.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

