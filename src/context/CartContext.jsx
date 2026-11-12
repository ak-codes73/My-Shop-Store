import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStoreSettings } from './StoreSettingsContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'atelier_cart_v1';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { settings } = useStoreSettings();
  const { success, error } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Compute item unique key based on ID + Variant
  const getItemKey = (product, variant) => {
    const variantId = variant?.size || variant?.scale || 'std';
    return `${product.id}_${variantId}`;
  };

  const addToCart = (product, selectedVariant, quantity = 1) => {
    if (!product) return;

    // Check availability
    const availableStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock;
    if (availableStock <= 0) {
      error(`Sorry, "${product.name}" is currently out of stock.`);
      return false;
    }

    const key = getItemKey(product, selectedVariant);
    const itemPrice = selectedVariant?.price !== undefined ? selectedVariant.price : product.price;
    const itemImage = product.images?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === key);
      if (existingIndex >= 0) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > availableStock) {
          error(`Only ${availableStock} units available in stock.`);
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        success(`Updated quantity for ${product.name}`);
        return updated;
      } else {
        if (quantity > availableStock) {
          error(`Only ${availableStock} units available in stock.`);
          return prev;
        }

        success(`Added "${product.name}" to cart`);
        return [
          ...prev,
          {
            key,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            category: product.category,
            brand: product.brand,
            image: itemImage,
            variant: selectedVariant?.size || selectedVariant?.scale || null,
            variantType: selectedVariant?.size ? 'Size' : selectedVariant?.scale ? 'Scale' : null,
            price: itemPrice,
            quantity,
            stock: availableStock
          }
        ];
      }
    });

    return true;
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(key);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          if (newQuantity > item.stock) {
            error(`Maximum available stock is ${item.stock}`);
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const freeDeliveryThreshold = settings?.free_delivery_threshold || 999;
  const configuredDeliveryCharge = settings?.delivery_charge || 99;

  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const deliveryCharge = isFreeDelivery || subtotal === 0 ? 0 : configuredDeliveryCharge;
  const totalAmount = subtotal + deliveryCharge;
  const freeDeliveryShortfall = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
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
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

