import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { db } from '../services/dbBridge';

const WishlistContext = createContext(null);
const WISHLIST_LOCAL_KEY = 'atelier_wishlist_v1';

export const WishlistProvider = ({ children }) => {
  const { user, isCustomerAuthenticated } = useAuth();
  const { success, info } = useToast();

  // Internal wishlist items list (stores full product objects for UI rendering)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_LOCAL_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const prevUserIdRef = useRef(null);

  // Sync / Load wishlist when user auth changes
  useEffect(() => {
    const syncWithDatabase = async () => {
      if (isCustomerAuthenticated && user?.id) {
        try {
          // If transitioning from guest or fresh login, sync local items into user's DB wishlist
          const localStored = localStorage.getItem(WISHLIST_LOCAL_KEY);
          let localItems = [];
          try {
            localItems = localStored ? JSON.parse(localStored) : [];
          } catch (e) {}

          if (localItems.length > 0 && prevUserIdRef.current !== user.id) {
            const localProductIds = localItems.map((p) => p.id).filter(Boolean);
            await db.syncUserWishlist(user.id, localProductIds);
          }

          // Fetch full list of user's wishlist product IDs from DB
          const dbProductIds = await db.getWishlistProductIds(user.id);

          if (dbProductIds.length > 0) {
            // Load product details for each ID
            const productPromises = dbProductIds.map((pid) => db.getProductById(pid));
            const fetchedProducts = await Promise.all(productPromises);
            const validProducts = fetchedProducts.filter(Boolean);
            setWishlist(validProducts);
          } else {
            setWishlist([]);
          }
        } catch (err) {
          console.warn('Error syncing database wishlist:', err);
        }
      } else {
        // Guest mode: load from local storage
        try {
          const saved = localStorage.getItem(WISHLIST_LOCAL_KEY);
          setWishlist(saved ? JSON.parse(saved) : []);
        } catch {
          setWishlist([]);
        }
      }
      prevUserIdRef.current = user?.id || null;
    };

    syncWithDatabase();
  }, [isCustomerAuthenticated, user?.id]);

  // Persist guest wishlist to localStorage
  useEffect(() => {
    if (!isCustomerAuthenticated) {
      try {
        localStorage.setItem(WISHLIST_LOCAL_KEY, JSON.stringify(wishlist));
      } catch (e) {
        console.warn('Failed to save guest wishlist to localStorage', e);
      }
    }
  }, [wishlist, isCustomerAuthenticated]);

  const toggleWishlist = async (product) => {
    if (!product?.id) return;
    const exists = wishlist.some((item) => item.id === product.id);

    if (exists) {
      info(`Removed "${product.name}" from wishlist`);
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));

      if (isCustomerAuthenticated && user?.id) {
        try {
          await db.removeFromUserWishlist(user.id, product.id);
        } catch (e) {
          console.warn('Failed to remove from DB wishlist:', e);
        }
      }
    } else {
      success(`Added "${product.name}" to wishlist`);
      setWishlist((prev) => [...prev, product]);

      if (isCustomerAuthenticated && user?.id) {
        try {
          await db.addToUserWishlist(user.id, product.id);
        } catch (e) {
          console.warn('Failed to save to DB wishlist:', e);
        }
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
