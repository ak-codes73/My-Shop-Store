import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, Check, 
  ArrowLeft, Star, MessageCircle, Info, Sparkles 
} from 'lucide-react';
import { db } from '../services/dbBridge';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { formatCurrency } from '../utils/formatters';
import { ProductCard } from '../components/products/ProductCard';

export const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { settings } = useStoreSettings();

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const item = await db.getProductBySlug(slug);
        if (item) {
          setProduct(item);
          // Set initial default variant
          if (Array.isArray(item.variants) && item.variants.length > 0) {
            setSelectedVariant(item.variants[0]);
          }

          // Fetch related items
          const related = await db.getProducts({ category: item.category });
          setRelatedProducts(related.filter((p) => p.id !== item.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase font-bold tracking-wider text-muted">Loading collectible details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Collectible Not Found</h2>
        <p className="text-xs text-muted">The product you are looking for has been retired or moved.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const isPoster = product.category === 'posters';
  const variants = product.variants || [];
  const currentPrice = selectedVariant?.price !== undefined ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice !== undefined ? selectedVariant.originalPrice : product.original_price;
  const currentStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock;

  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'];

  const handleAddToCart = () => {
    const success = addToCart(product, selectedVariant, quantity);
    if (success) {
      setIsCartOpen(true);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Atelier, I'm interested in "${product.name}" (${selectedVariant ? selectedVariant.size || selectedVariant.scale : 'Standard'}) priced at INR ${currentPrice}. Is this available for delivery?`
  );
  const whatsappUrl = `https://wa.me/${settings?.whatsapp_number?.replace(/\D/g, '') || '919876543210'}?text=${whatsappMessage}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-muted">
        <Link to="/shop" className="inline-flex items-center gap-1.5 hover:text-charcoal font-semibold transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collection</span>
        </Link>
        <span className="uppercase tracking-wider text-[11px]">
          Home / {isPoster ? 'Posters' : 'Die-Cast'} / {product.subcategory}
        </span>
      </div>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-border-light shadow-card flex items-center justify-center">
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_best_seller && (
                <span className="px-3 py-1 bg-charcoal text-white text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-sm">
                  Best Seller
                </span>
              )}
              {discountPercent > 0 && (
                <span className="px-3 py-1 bg-white/95 text-charcoal border border-border-light text-[10px] font-bold tracking-wider rounded-lg shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white text-charcoal rounded-full shadow-md transition-all hover:scale-110"
              title="Save to Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-charcoal'
                }`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-charcoal shadow-sm ring-2 ring-charcoal/10'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-border-light pb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-muted">
              {isPoster ? `Poster & Wall Art / ${product.subcategory}` : `Precision Die-Cast / ${product.brand}`}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal leading-tight">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-3xl font-extrabold text-charcoal">
                {formatCurrency(currentPrice)}
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span className="text-base text-muted line-through">
                  {formatCurrency(currentOriginalPrice)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Save {formatCurrency(currentOriginalPrice - currentPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Overview</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Variants Selector (Sizes for Posters, Scales for Die-Cast) */}
          {variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border-light">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Select {isPoster ? 'Poster Size' : 'Die-Cast Scale'}
                </label>
                {isPoster && (
                  <span className="text-[11px] text-muted">
                    Archival 320 GSM Matte Paper
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-charcoal bg-charcoal text-white shadow-sm'
                          : isOutOfStock
                          ? 'border-border-light bg-cream-100 text-muted line-through cursor-not-allowed opacity-50'
                          : 'border-border-light bg-white text-charcoal hover:border-charcoal'
                      }`}
                    >
                      <div className="text-xs font-bold">{label}</div>
                      <div className={`text-xs mt-0.5 ${isSelected ? 'text-charcoal-200' : 'text-muted'}`}>
                        {formatCurrency(v.price)}
                      </div>
                      <div className={`text-[10px] mt-1 ${isSelected ? 'text-accent' : 'text-emerald-700 font-semibold'}`}>
                        {isOutOfStock ? 'Sold Out' : `${v.stock} in stock`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="pt-2">
            {currentStock > 10 ? (
              <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Ready for Immediate Express Dispatch
              </span>
            ) : currentStock > 0 ? (
              <span className="text-amber-700 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Limited Edition Drop: Only {currentStock} units remain
              </span>
            ) : (
              <span className="text-red-600 text-xs font-semibold">
                Out of Stock - Join Waitlist or Contact Us
              </span>
            )}
          </div>

          {/* Actions: Quantity + Add to Bag */}
          <div className="pt-4 border-t border-border-light space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center border border-border-light rounded-xl bg-white px-3 py-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 font-bold text-charcoal hover:opacity-70"
                  disabled={quantity <= 1 || currentStock <= 0}
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-charcoal">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="px-2 font-bold text-charcoal hover:opacity-70"
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
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-8 rounded-xl text-xs uppercase tracking-widest font-extrabold transition-all shadow-md ${
                  currentStock <= 0
                    ? 'bg-cream-300 text-muted cursor-not-allowed'
                    : 'bg-charcoal text-white hover:bg-black'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{currentStock <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
              </button>
            </div>

            {/* Direct WhatsApp Quick Order */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-emerald-600/30 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs uppercase font-bold tracking-wider transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ask a Specialist on WhatsApp</span>
            </a>
          </div>

          {/* Specifications Accordion / Panel */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="bg-cream-50 rounded-2xl p-5 border border-border-light space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                <Info className="w-4 h-4 text-accent" />
                <span>Technical Specifications</span>
              </h4>
              <dl className="grid grid-cols-1 gap-2 text-xs divide-y divide-border-light/60">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="pt-2 flex justify-between gap-4">
                    <dt className="text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                    <dd className="font-semibold text-charcoal text-right">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border-light text-center">
            <div className="p-3 bg-white rounded-xl border border-border-light">
              <Truck className="w-5 h-5 mx-auto text-accent mb-1" />
              <span className="text-[10px] font-semibold text-charcoal block">Pan-India Express</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-border-light">
              <ShieldCheck className="w-5 h-5 mx-auto text-accent mb-1" />
              <span className="text-[10px] font-semibold text-charcoal block">Zero-Fee UPI</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-border-light">
              <RefreshCw className="w-5 h-5 mx-auto text-accent mb-1" />
              <span className="text-[10px] font-semibold text-charcoal block">Damage Protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-border-light">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
              You Might Also Like
            </h3>
            <Link
              to={`/shop?category=${product.category}`}
              className="text-xs font-bold uppercase tracking-wider text-charcoal hover:underline"
            >
              View All {isPoster ? 'Posters' : 'Die-Casts'}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

