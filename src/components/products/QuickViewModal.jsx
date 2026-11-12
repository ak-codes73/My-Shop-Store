import React, { useState } from 'react';
import { X, Check, ShoppingBag, Eye, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../utils/formatters';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Selected variant state
  const isPoster = product?.category === 'posters';
  const variants = product?.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(() => variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const currentPrice = selectedVariant?.price !== undefined ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice !== undefined ? selectedVariant.originalPrice : product.original_price;
  const currentStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock;

  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    const success = addToCart(product, selectedVariant, quantity);
    if (success) {
      onClose();
      setIsCartOpen(true);
    }
  };

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lift overflow-hidden border border-border-light flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-charcoal rounded-full shadow-sm transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Gallery Section */}
        <div className="w-full md:w-1/2 p-6 bg-cream-50 flex flex-col justify-between">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-border-light flex items-center justify-center">
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-charcoal text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail row */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-charcoal shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Category / Brand */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest uppercase text-muted">
                {isPoster ? `Poster / ${product.subcategory}` : `Model Car / ${product.brand || 'Die-Cast'}`}
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className="text-muted hover:text-red-500 transition-colors p-1"
                title="Save to Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </button>
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal leading-snug">
              {product.name}
            </h2>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-charcoal">
                {formatCurrency(currentPrice)}
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span className="text-sm text-muted line-through">
                  {formatCurrency(currentOriginalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-charcoal-500 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border-light">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Select {isPoster ? 'Poster Size' : 'Die-Cast Scale'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => {
                    const label = v.size || v.scale;
                    const isSelected = selectedVariant && (selectedVariant.size === v.size && selectedVariant.scale === v.scale);
                    const isOutOfStock = v.stock <= 0;

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
                          isSelected
                            ? 'bg-charcoal text-white border-charcoal shadow-sm'
                            : isOutOfStock
                            ? 'bg-cream-100 text-muted border-border-light line-through cursor-not-allowed opacity-50'
                            : 'bg-white text-charcoal border-border-light hover:border-charcoal'
                        }`}
                      >
                        {label} &bull; {formatCurrency(v.price)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock status indicator */}
            <div className="text-xs pt-1">
              {currentStock > 10 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> In Stock & Ready to Dispatch
                </span>
              ) : currentStock > 0 ? (
                <span className="text-amber-700 font-semibold">
                  Only {currentStock} left in stock - order soon!
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 mt-6 border-t border-border-light space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-border-light rounded-xl bg-cream-50 px-2 py-1.5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 text-charcoal hover:font-bold"
                  disabled={quantity <= 1 || currentStock <= 0}
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-charcoal">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="px-2 text-charcoal hover:font-bold"
                  disabled={quantity >= currentStock || currentStock <= 0}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                disabled={currentStock <= 0}
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs uppercase tracking-wider font-bold transition-all shadow-sm ${
                  currentStock <= 0
                    ? 'bg-cream-300 text-muted cursor-not-allowed'
                    : 'bg-charcoal text-white hover:bg-black'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{currentStock <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" /> Verified UPI Payment & Express Packaging Included
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

