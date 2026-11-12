import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

export const CartDrawer = () => {
  const {
    cart,
    itemCount,
    subtotal,
    deliveryCharge,
    totalAmount,
    isFreeDelivery,
    freeDeliveryThreshold,
    freeDeliveryShortfall,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-border-light flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-charcoal" />
              <h2 className="font-serif text-lg font-bold tracking-wide uppercase text-charcoal">
                Your Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-muted hover:text-charcoal hover:bg-cream transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Bar */}
          <div className="bg-cream-100 px-6 py-3 border-b border-border-light text-xs">
            <div className="flex items-center justify-between font-semibold text-charcoal mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-accent" />
                {isFreeDelivery ? (
                  <span className="text-emerald-700 font-bold">You unlocked FREE Express Shipping!</span>
                ) : (
                  <span>
                    Add <strong className="text-charcoal">{formatCurrency(freeDeliveryShortfall)}</strong> more for FREE Shipping!
                  </span>
                )}
              </span>
              <span>{Math.round(freeDeliveryProgress)}%</span>
            </div>
            <div className="w-full bg-cream-300 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-charcoal h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-border-light">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-cream-100 rounded-full flex items-center justify-center text-muted">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="font-serif text-base font-bold text-charcoal">Your bag is currently empty</h3>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Explore our limited edition art posters and precision die-cast collectibles.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.key} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-cream border border-border-light shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs text-charcoal leading-snug line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.key)}
                          className="text-muted hover:text-red-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Badge */}
                      {item.variant && (
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 bg-cream-100 text-charcoal-700 text-[10px] font-semibold rounded-md border border-border-light">
                            {item.variantType || 'Variant'}: {item.variant}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price and Quantity Control */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-border-light rounded-lg bg-cream-50">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="p-1 hover:text-charcoal text-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="p-1 hover:text-charcoal text-muted transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-xs text-charcoal">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-border-light bg-cream-50 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-charcoal">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatCurrency(deliveryCharge)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-border-light flex justify-between text-sm font-bold text-charcoal">
                  <span>Total Amount</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-charcoal text-white rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-black transition-all shadow-md group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[10px] text-center text-muted">
                Safe and secure direct UPI verification at payment step.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

