import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  const handleMoveToBag = (product) => {
    const defaultVariant = product.variants?.[0] || null;
    const success = addToCart(product, defaultVariant, 1);
    if (success) {
      toggleWishlist(product);
      setIsCartOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="pb-6 border-b border-border-light">
        <span className="text-xs uppercase font-bold tracking-widest text-muted">
          Personal Vault
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-charcoal mt-1">
          Your Saved Collectibles ({wishlist.length})
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border-light p-16 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center text-muted mx-auto">
            <Heart className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="font-serif text-lg font-bold text-charcoal">Your wishlist is currently empty</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Click the heart icon on any poster or die-cast model to save it to your wishlist for later.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-black transition-colors"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
            const price = product.price;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-soft flex flex-col justify-between"
              >
                <div className="relative aspect-[4/5] bg-cream-50 overflow-hidden">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-red-500 rounded-full shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      {product.category === 'posters' ? 'Poster' : `Die-Cast / ${product.brand || 'Model'}`}
                    </span>
                    <Link to={`/product/${product.slug}`}>
                      <h4 className="font-serif font-bold text-sm text-charcoal line-clamp-1 hover:underline">
                        {product.name}
                      </h4>
                    </Link>
                    <p className="font-extrabold text-sm text-charcoal mt-1">
                      {formatCurrency(price)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-black transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

