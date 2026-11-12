import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import { QuickViewModal } from './QuickViewModal';

export const ProductCard = ({ product }) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isPoster = product.category === 'posters';

  // Calculate starting price or variant price
  const variants = product.variants || [];
  const lowestPrice = variants.length > 0 
    ? Math.min(...variants.map(v => v.price))
    : product.price;

  const originalPrice = product.original_price;
  const discountPercent = originalPrice && originalPrice > lowestPrice
    ? Math.round(((originalPrice - lowestPrice) / originalPrice) * 100)
    : 0;

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has multiple variants (e.g. sizes/scales), open quick view modal for selection
    if (variants.length > 1) {
      setIsQuickViewOpen(true);
    } else {
      const defaultVariant = variants[0] || null;
      const success = addToCart(product, defaultVariant, 1);
      if (success) {
        setIsCartOpen(true);
      }
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-border-light overflow-hidden transition-all duration-300 hover:shadow-card hover:-translate-y-1 flex flex-col justify-between">
        {/* Image Container */}
        <Link to={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-cream-50 block">
          {/* Main & Secondary Image with Hover Transition */}
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {isOutOfStock ? (
              <span className="px-2.5 py-1 bg-red-600/90 text-white text-[10px] uppercase font-bold tracking-wider rounded-md shadow-sm">
                Sold Out
              </span>
            ) : product.is_best_seller ? (
              <span className="px-2.5 py-1 bg-charcoal text-white text-[10px] uppercase font-bold tracking-wider rounded-md shadow-sm">
                Best Seller
              </span>
            ) : product.is_featured ? (
              <span className="px-2.5 py-1 bg-accent-dark text-white text-[10px] uppercase font-bold tracking-wider rounded-md shadow-sm">
                Featured
              </span>
            ) : null}

            {discountPercent > 0 && !isOutOfStock && (
              <span className="px-2.5 py-1 bg-white/95 text-charcoal border border-border-light text-[10px] font-bold tracking-wider rounded-md shadow-sm">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-charcoal rounded-full shadow-sm transition-all duration-200 z-10 hover:scale-110"
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label="Wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-charcoal'
              }`}
            />
          </button>

          {/* Quick Action Overlay (Desktop) */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10 hidden sm:flex">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex-1 py-2.5 px-3 bg-white/95 hover:bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>

            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-xl shadow-md transition-all flex items-center justify-center ${
                isOutOfStock
                  ? 'bg-cream-300 text-muted cursor-not-allowed'
                  : 'bg-charcoal text-white hover:bg-black'
              }`}
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </Link>

        {/* Content Details */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Category / Brand metadata */}
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted mb-1 flex items-center justify-between">
              <span>{isPoster ? `Poster / ${product.subcategory}` : product.brand || 'Die-Cast'}</span>
              {variants.length > 0 && (
                <span className="text-charcoal-400 font-semibold lowercase">
                  {variants.length} {isPoster ? 'sizes' : 'scales'}
                </span>
              )}
            </div>

            {/* Product Title */}
            <Link to={`/product/${product.slug}`}>
              <h3 className="font-serif text-sm font-bold text-charcoal line-clamp-1 group-hover:text-black transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Pricing & Mobile Action */}
          <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-extrabold text-charcoal">
                {formatCurrency(lowestPrice)}
              </span>
              {originalPrice && originalPrice > lowestPrice && (
                <span className="text-xs text-muted line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>

            {/* Mobile Quick Add Button */}
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="sm:hidden p-2 bg-charcoal text-white rounded-lg text-xs font-semibold disabled:bg-cream-300 disabled:text-muted"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
};

