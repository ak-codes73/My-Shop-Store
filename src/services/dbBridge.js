import { supabase, isSupabaseConfigured } from './supabase';
import { initialProducts } from '../data/initialProducts';
import { initialSettings } from '../data/initialSettings';
import { generateOrderId, generateId } from '../utils/formatters';

// Storage keys for persistent local fallback
const STORAGE_KEYS = {
  PRODUCTS: 'atelier_db_products_v1',
  ORDERS: 'atelier_db_orders_v1',
  PAYMENTS: 'atelier_db_payments_v1',
  SETTINGS: 'atelier_db_settings_v1',
  CUSTOM_REQUESTS: 'atelier_db_custom_requests_v1',
  PROFILES: 'atelier_db_profiles_v1',
  USER_WISHLIST: 'atelier_db_wishlist_v1',
  ADMIN_USERS: 'atelier_db_admin_users_v1'
};

// Initial admin users list for authorization check
const initialAdminUsers = [
  { id: 'admin-seed-001', email: 'admin@atelier.store', role: 'admin' }
];

// Seed initial demo orders so admin dashboard has real data immediately
const initialOrders = [
  {
    id: 'ord-seed-001',
    order_number: 'ORD-20261108-5421',
    user_id: null, // guest checkout
    customer_name: 'Vikramaditya Sharma',
    phone: '9876543210',
    email: 'vikram.sharma@example.com',
    address: '402, Skyline Residency, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    items: [
      {
        product_id: 'prod-post-001',
        name: 'Neo-Tokyo Akira Cyberpunk Canvas',
        variant: 'A3',
        price: 799,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80'
      },
      {
        product_id: 'prod-diecast-001',
        name: 'Lamborghini Aventador SVJ Verde Alceo',
        variant: '1:24',
        price: 4999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 5798,
    delivery_charge: 0,
    total_amount: 5798,
    order_status: 'Payment Verification',
    created_at: '2026-11-08T18:40:00Z',
    updated_at: '2026-11-08T18:55:00Z'
  },
  {
    id: 'ord-seed-002',
    order_number: 'ORD-20261107-9104',
    user_id: null,
    customer_name: 'Rohan Mehra',
    phone: '9988776655',
    email: 'rohan.mehra@example.com',
    address: 'B-12, Green Park Extension',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110016',
    items: [
      {
        product_id: 'prod-post-002',
        name: 'Porsche 911 GT3 RS Blueprint Technical Art',
        variant: 'A4',
        price: 549,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 1098,
    delivery_charge: 0,
    total_amount: 1098,
    order_status: 'Confirmed',
    created_at: '2026-11-07T14:15:00Z',
    updated_at: '2026-11-07T15:00:00Z'
  }
];

const initialPayments = [
  {
    id: 'pay-seed-001',
    order_id: 'ord-seed-001',
    payment_method: 'UPI_QR',
    upi_reference_id: '431489201948',
    screenshot_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    payment_status: 'Pending Verification',
    submitted_at: '2026-11-08T18:55:00Z',
    verified_at: null,
    verified_by: null,
    rejection_reason: null,
    created_at: '2026-11-08T18:40:00Z',
    updated_at: '2026-11-08T18:55:00Z'
  },
  {
    id: 'pay-seed-002',
    order_id: 'ord-seed-002',
    payment_method: 'UPI_QR',
    upi_reference_id: '431378901234',
    screenshot_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    payment_status: 'Verified',
    submitted_at: '2026-11-07T14:30:00Z',
    verified_at: '2026-11-07T15:00:00Z',
    verified_by: 'admin@atelier.store',
    rejection_reason: null,
    created_at: '2026-11-07T14:15:00Z',
    updated_at: '2026-11-07T15:00:00Z'
  }
];

const initialCustomRequests = [
  {
    id: 'req-seed-001',
    customer_name: 'Ananya Rao',
    phone: '9845123456',
    email: 'ananya.rao@example.com',
    request_type: 'custom_poster',
    poster_size: 'A3',
    design_description: 'Studio Ghibli style Spirited Away bathhouse night view with glowing lanterns and soot sprites in corner.',
    reference_image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    budget: 999,
    status: 'In Review',
    admin_notes: 'Artist reviewing high-res render.',
    created_at: '2026-11-08T12:00:00Z',
    updated_at: '2026-11-08T12:00:00Z'
  }
];

// In-browser Broadcast Channel for multi-tab synchronization
let broadcastChannel = null;
try {
  broadcastChannel = new BroadcastChannel('atelier_realtime_bus');
} catch (e) {}

// Local Storage Helper
const getStored = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn(`Error reading from localStorage for key ${key}:`, err);
    return fallback;
  }
};

const setStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing to localStorage for key ${key}:`, err);
  }
};

// Dispatch local real-time event
const notifyChange = (table, payload) => {
  const event = new CustomEvent(`db_change_${table}`, { detail: payload });
  window.dispatchEvent(event);
  
  if (broadcastChannel) {
    broadcastChannel.postMessage({ table, payload, timestamp: Date.now() });
  }
};

// Listen to broadcast messages across tabs
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    const { table, payload } = event.data;
    if (table) {
      window.dispatchEvent(new CustomEvent(`db_change_${table}`, { detail: payload }));
    }
  };
}

// Initialize tables if needed
const initLocalStore = () => {
  getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
  getStored(STORAGE_KEYS.ORDERS, initialOrders);
  getStored(STORAGE_KEYS.PAYMENTS, initialPayments);
  getStored(STORAGE_KEYS.SETTINGS, initialSettings);
  getStored(STORAGE_KEYS.CUSTOM_REQUESTS, initialCustomRequests);
  getStored(STORAGE_KEYS.PROFILES, {});
  getStored(STORAGE_KEYS.USER_WISHLIST, {});
  getStored(STORAGE_KEYS.ADMIN_USERS, initialAdminUsers);
};
initLocalStore();

export const db = {
  // --------------------------------------------------------------------------
  // REALTIME SUBSCRIPTION
  // --------------------------------------------------------------------------
  subscribe(table, callback) {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`realtime_${table}_${Math.random()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            callback(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      const handler = (e) => callback(e.detail);
      window.addEventListener(`db_change_${table}`, handler);
      return () => {
        window.removeEventListener(`db_change_${table}`, handler);
      };
    }
  },

  // --------------------------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------------------------
  async getProducts(filters = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('products').select('*');
        if (filters.category) query = query.eq('category', filters.category);
        if (filters.subcategory) query = query.eq('subcategory', filters.subcategory);
        if (filters.brand) query = query.eq('brand', filters.brand);
        if (filters.is_featured) query = query.eq('is_featured', true);
        if (filters.is_best_seller) query = query.eq('is_best_seller', true);
        
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query failed, falling back to local database:', err);
      }
    }

    let items = getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    
    if (filters.category) {
      items = items.filter(p => p.category === filters.category);
    }
    if (filters.subcategory) {
      items = items.filter(p => p.subcategory?.toLowerCase() === filters.subcategory.toLowerCase());
    }
    if (filters.brand) {
      items = items.filter(p => p.brand?.toLowerCase() === filters.brand.toLowerCase());
    }
    if (filters.is_featured) {
      items = items.filter(p => p.is_featured);
    }
    if (filters.is_best_seller) {
      items = items.filter(p => p.is_best_seller);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.model?.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    if (filters.minPrice !== undefined) {
      items = items.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      items = items.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.size) {
      items = items.filter(p => 
        Array.isArray(p.variants) && p.variants.some(v => v.size === filters.size)
      );
    }
    if (filters.scale) {
      items = items.filter(p => 
        Array.isArray(p.variants) && p.variants.some(v => v.scale === filters.scale)
      );
    }

    if (filters.sortBy === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'newest') {
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filters.sortBy === 'popularity') {
      items.sort((a, b) => (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0));
    }

    return items;
  },

  async getProductById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const items = getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    return items.find(p => p.id === id) || null;
  },

  async getProductBySlug(slug) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const items = getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    return items.find(p => p.slug === slug) || null;
  },

  async saveProduct(product) {
    const isNew = !product.id;
    const now = new Date().toISOString();
    const productData = {
      ...product,
      id: product.id || generateId('prod'),
      slug: product.slug || (product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')),
      created_at: product.created_at || now,
      updated_at: now
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .upsert(productData)
          .select()
          .single();
        if (!error && data) {
          notifyChange('products', { eventType: isNew ? 'INSERT' : 'UPDATE', new: data });
          return data;
        }
      } catch (err) {
        console.warn('Supabase saveProduct failed, saving locally:', err);
      }
    }

    const items = getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    const index = items.findIndex(p => p.id === productData.id);
    let updatedList;
    if (index >= 0) {
      items[index] = productData;
      updatedList = [...items];
    } else {
      updatedList = [productData, ...items];
    }
    setStored(STORAGE_KEYS.PRODUCTS, updatedList);
    notifyChange('products', { eventType: index >= 0 ? 'UPDATE' : 'INSERT', new: productData });
    return productData;
  },

  async deleteProduct(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
          notifyChange('products', { eventType: 'DELETE', old: { id } });
          return true;
        }
      } catch (e) {}
    }

    const items = getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    const updated = items.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    notifyChange('products', { eventType: 'DELETE', old: { id } });
    return true;
  },

  // --------------------------------------------------------------------------
  // CUSTOMER PROFILES
  // --------------------------------------------------------------------------
  async getProfile(userId) {
    if (!userId) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error && data) return data;
      } catch (e) {}
    }

    const profiles = getStored(STORAGE_KEYS.PROFILES, {});
    return profiles[userId] || null;
  },

  async saveProfile(userId, profileData) {
    if (!userId) return null;
    const now = new Date().toISOString();

    const payload = {
      id: userId,
      ...profileData,
      updated_at: now
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(payload)
          .select()
          .single();
        if (!error && data) {
          notifyChange('profiles', { eventType: 'UPDATE', new: data });
          return data;
        }
      } catch (e) {}
    }

    const profiles = getStored(STORAGE_KEYS.PROFILES, {});
    profiles[userId] = { ...profiles[userId], ...payload };
    setStored(STORAGE_KEYS.PROFILES, profiles);
    notifyChange('profiles', { eventType: 'UPDATE', new: profiles[userId] });
    return profiles[userId];
  },

  // --------------------------------------------------------------------------
  // DATABASE WISHLIST (FOR LOGGED-IN CUSTOMERS)
  // --------------------------------------------------------------------------
  async getWishlistProductIds(userId) {
    if (!userId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_wishlist')
          .select('product_id')
          .eq('user_id', userId);
        if (!error && data) {
          return data.map(item => item.product_id);
        }
      } catch (e) {}
    }

    const wishlistStore = getStored(STORAGE_KEYS.USER_WISHLIST, {});
    return wishlistStore[userId] || [];
  },

  async addToUserWishlist(userId, productId) {
    if (!userId || !productId) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('user_wishlist')
          .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id, product_id' });
      } catch (e) {}
    }

    const wishlistStore = getStored(STORAGE_KEYS.USER_WISHLIST, {});
    const current = wishlistStore[userId] || [];
    if (!current.includes(productId)) {
      wishlistStore[userId] = [...current, productId];
      setStored(STORAGE_KEYS.USER_WISHLIST, wishlistStore);
    }
  },

  async removeFromUserWishlist(userId, productId) {
    if (!userId || !productId) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('user_wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);
      } catch (e) {}
    }

    const wishlistStore = getStored(STORAGE_KEYS.USER_WISHLIST, {});
    const current = wishlistStore[userId] || [];
    wishlistStore[userId] = current.filter(id => id !== productId);
    setStored(STORAGE_KEYS.USER_WISHLIST, wishlistStore);
  },

  async syncUserWishlist(userId, productIds = []) {
    if (!userId || !Array.isArray(productIds) || productIds.length === 0) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const rows = productIds.map(pid => ({ user_id: userId, product_id: pid }));
        await supabase.from('user_wishlist').upsert(rows, { onConflict: 'user_id, product_id' });
      } catch (e) {}
    }

    const wishlistStore = getStored(STORAGE_KEYS.USER_WISHLIST, {});
    const current = wishlistStore[userId] || [];
    const merged = Array.from(new Set([...current, ...productIds]));
    wishlistStore[userId] = merged;
    setStored(STORAGE_KEYS.USER_WISHLIST, wishlistStore);
  },

  // --------------------------------------------------------------------------
  // ADMIN AUTHORIZATION VERIFICATION
  // --------------------------------------------------------------------------
  async checkIsAdmin(userId, userEmail) {
    if (!userId && !userEmail) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        // Strict query against public.admin_users
        let query = supabase.from('admin_users').select('id, email, role');
        if (userId) {
          query = query.eq('id', userId);
        } else if (userEmail) {
          query = query.eq('email', userEmail.toLowerCase().trim());
        }
        const { data, error } = await query.single();
        if (!error && data) return true;
      } catch (e) {
        return false;
      }
    }

    // Local fallback check
    const adminList = getStored(STORAGE_KEYS.ADMIN_USERS, initialAdminUsers);
    return adminList.some(
      a => (userId && a.id === userId) || (userEmail && a.email?.toLowerCase() === userEmail.toLowerCase())
    );
  },

  // --------------------------------------------------------------------------
  // ORDERS
  // --------------------------------------------------------------------------
  async getOrders(filters = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (filters.status) query = query.eq('order_status', filters.status);
        if (filters.user_id) query = query.eq('user_id', filters.user_id);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {}
    }

    let orders = getStored(STORAGE_KEYS.ORDERS, initialOrders);
    if (filters.status) {
      orders = orders.filter(o => o.order_status === filters.status);
    }
    if (filters.user_id) {
      orders = orders.filter(o => o.user_id === filters.user_id);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      orders = orders.filter(o => 
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.phone?.includes(q)
      );
    }
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return orders;
  },

  async getOrdersByUserId(userId) {
    if (!userId) return [];
    return this.getOrders({ user_id: userId });
  },

  async getOrderById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const orders = getStored(STORAGE_KEYS.ORDERS, initialOrders);
    return orders.find(o => o.id === id || o.order_number === id) || null;
  },

  async verifyOrderForTracking(orderNumber, phone) {
    const cleanNum = orderNumber?.trim().toUpperCase();
    const cleanPhone = phone?.trim().replace(/\D/g, '');

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', cleanNum)
          .single();

        if (!error && data) {
          const storedPhone = data.phone?.replace(/\D/g, '');
          if (storedPhone.endsWith(cleanPhone) || cleanPhone.endsWith(storedPhone)) {
            return data;
          }
        }
      } catch (e) {}
    }

    const orders = getStored(STORAGE_KEYS.ORDERS, initialOrders);
    const found = orders.find(o => o.order_number.toUpperCase() === cleanNum);
    if (found) {
      const storedPhone = found.phone.replace(/\D/g, '');
      if (storedPhone.endsWith(cleanPhone) || cleanPhone.endsWith(storedPhone)) {
        return found;
      }
    }
    return null;
  },

  async createOrder(orderPayload) {
    const now = new Date().toISOString();
    const orderNumber = generateOrderId();
    const orderId = generateId('ord');

    const newOrder = {
      ...orderPayload,
      id: orderId,
      order_number: orderNumber,
      user_id: orderPayload.user_id || null, // Nullable for guest checkout
      order_status: 'Pending',
      created_at: now,
      updated_at: now
    };

    const newPayment = {
      id: generateId('pay'),
      order_id: orderId,
      payment_method: 'UPI_QR',
      upi_reference_id: null,
      screenshot_url: null,
      payment_status: 'Awaiting Payment',
      submitted_at: null,
      verified_at: null,
      verified_by: null,
      rejection_reason: null,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: createdOrder, error: orderErr } = await supabase
          .from('orders')
          .insert(newOrder)
          .select()
          .single();
        if (!orderErr && createdOrder) {
          await supabase.from('payments').insert(newPayment);
          notifyChange('orders', { eventType: 'INSERT', new: createdOrder });
          notifyChange('payments', { eventType: 'INSERT', new: newPayment });
          return createdOrder;
        }
      } catch (err) {
        console.warn('Supabase createOrder failed, saving locally:', err);
      }
    }

    const orders = getStored(STORAGE_KEYS.ORDERS, initialOrders);
    orders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, orders);

    const payments = getStored(STORAGE_KEYS.PAYMENTS, initialPayments);
    payments.unshift(newPayment);
    setStored(STORAGE_KEYS.PAYMENTS, payments);

    notifyChange('orders', { eventType: 'INSERT', new: newOrder });
    notifyChange('payments', { eventType: 'INSERT', new: newPayment });

    return newOrder;
  },

  async updateOrderStatus(orderId, newStatus) {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ order_status: newStatus, updated_at: now })
          .eq('id', orderId)
          .select()
          .single();
        if (!error && data) {
          notifyChange('orders', { eventType: 'UPDATE', new: data });
          return data;
        }
      } catch (e) {}
    }

    const orders = getStored(STORAGE_KEYS.ORDERS, initialOrders);
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index] = { ...orders[index], order_status: newStatus, updated_at: now };
      setStored(STORAGE_KEYS.ORDERS, orders);
      notifyChange('orders', { eventType: 'UPDATE', new: orders[index] });
      return orders[index];
    }
    return null;
  },

  // --------------------------------------------------------------------------
  // PAYMENTS (Manual UPI Verification Workflow)
  // --------------------------------------------------------------------------
  async getPayments() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {}
    }
    const payments = getStored(STORAGE_KEYS.PAYMENTS, initialPayments);
    return payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getPaymentByOrderId(orderId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('payments').select('*').eq('order_id', orderId).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const payments = getStored(STORAGE_KEYS.PAYMENTS, initialPayments);
    return payments.find(p => p.order_id === orderId) || null;
  },

  async submitPaymentDetails(orderId, upiReferenceId, screenshotUrl) {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .update({
            upi_reference_id: upiReferenceId,
            screenshot_url: screenshotUrl || null,
            payment_status: 'Pending Verification',
            submitted_at: now,
            updated_at: now,
            rejection_reason: null
          })
          .eq('order_id', orderId)
          .select()
          .single();

        if (!error && data) {
          await this.updateOrderStatus(orderId, 'Payment Verification');
          notifyChange('payments', { eventType: 'UPDATE', new: data });
          return data;
        }
      } catch (e) {}
    }

    const payments = getStored(STORAGE_KEYS.PAYMENTS, initialPayments);
    const index = payments.findIndex(p => p.order_id === orderId);
    let updatedPayment;
    if (index >= 0) {
      payments[index] = {
        ...payments[index],
        upi_reference_id: upiReferenceId,
        screenshot_url: screenshotUrl || payments[index].screenshot_url,
        payment_status: 'Pending Verification',
        submitted_at: now,
        updated_at: now,
        rejection_reason: null
      };
      updatedPayment = payments[index];
    } else {
      updatedPayment = {
        id: generateId('pay'),
        order_id: orderId,
        payment_method: 'UPI_QR',
        upi_reference_id: upiReferenceId,
        screenshot_url: screenshotUrl || null,
        payment_status: 'Pending Verification',
        submitted_at: now,
        verified_at: null,
        verified_by: null,
        rejection_reason: null,
        created_at: now,
        updated_at: now
      };
      payments.unshift(updatedPayment);
    }

    setStored(STORAGE_KEYS.PAYMENTS, payments);
    await this.updateOrderStatus(orderId, 'Payment Verification');
    notifyChange('payments', { eventType: 'UPDATE', new: updatedPayment });
    return updatedPayment;
  },

  async verifyPayment(orderId, adminEmail = 'admin@atelier.store') {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .update({
            payment_status: 'Verified',
            verified_at: now,
            verified_by: adminEmail,
            rejection_reason: null,
            updated_at: now
          })
          .eq('order_id', orderId)
          .select()
          .single();

        if (!error && data) {
          await this.updateOrderStatus(orderId, 'Confirmed');
          notifyChange('payments', { eventType: 'UPDATE', new: data });
          return data;
        }
      } catch (e) {}
    }

    const payments = getStored(STORAGE_KEYS.PAYMENTS, initialPayments);
    const index = payments.findIndex(p => p.order_id === orderId);
    if (index >= 0) {
      payments[index] = {
        ...payments[index],
        payment_status: 'Verified',
        verified_at: now,
        verified_by: adminEmail,
        rejection_reason: null,
        updated_at: now
      };
      setStored(STORAGE_KEYS.PAYMENTS, payments);
      await this.updateOrderStatus(orderId, 'Confirmed');
      notifyChange('payments', { eventType: 'UPDATE', new: payments[index] });
      return payments[index];
    }
    return null;
  },

  async rejectPayment(orderId, rejectionReason, adminEmail = 'admin@atelier.store') {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .update({
            payment_status: 'Rejected',
            rejection_reason: rejectionReason,
            verified_at: now,
            verified_by: adminEmail,
            updated_at: now
          })
          .eq('order_id', orderId)
          .select()
          .single();

        if (!error && data) {
          notifyChange('payments', { eventType: 'UPDATE', new: data });
          return data;
        }
      } catch (e) {}
    }

    const payments = getStored(STORAGE_KEYS.PAYMENTS, initialPayments);
    const index = payments.findIndex(p => p.order_id === orderId);
    if (index >= 0) {
      payments[index] = {
        ...payments[index],
        payment_status: 'Rejected',
        rejection_reason: rejectionReason,
        verified_at: now,
        verified_by: adminEmail,
        updated_at: now
      };
      setStored(STORAGE_KEYS.PAYMENTS, payments);
      notifyChange('payments', { eventType: 'UPDATE', new: payments[index] });
      return payments[index];
    }
    return null;
  },

  // --------------------------------------------------------------------------
  // STORE SETTINGS
  // --------------------------------------------------------------------------
  async getSettings() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    return getStored(STORAGE_KEYS.SETTINGS, initialSettings);
  },

  async updateSettings(newSettings) {
    const now = new Date().toISOString();
    const updated = { ...newSettings, updated_at: now };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .upsert(updated)
          .select()
          .single();
        if (!error && data) {
          notifyChange('store_settings', { eventType: 'UPDATE', new: data });
          return data;
        }
      } catch (e) {}
    }

    setStored(STORAGE_KEYS.SETTINGS, updated);
    notifyChange('store_settings', { eventType: 'UPDATE', new: updated });
    return updated;
  },

  // --------------------------------------------------------------------------
  // CUSTOM REQUESTS
  // --------------------------------------------------------------------------
  async getCustomRequests() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('custom_requests').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {}
    }
    return getStored(STORAGE_KEYS.CUSTOM_REQUESTS, initialCustomRequests);
  },

  async createCustomRequest(req) {
    const now = new Date().toISOString();
    const newReq = {
      ...req,
      id: generateId('req'),
      status: 'Submitted',
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('custom_requests').insert(newReq).select().single();
        if (!error && data) {
          notifyChange('custom_requests', { eventType: 'INSERT', new: data });
          return data;
        }
      } catch (e) {}
    }

    const list = getStored(STORAGE_KEYS.CUSTOM_REQUESTS, initialCustomRequests);
    list.unshift(newReq);
    setStored(STORAGE_KEYS.CUSTOM_REQUESTS, list);
    notifyChange('custom_requests', { eventType: 'INSERT', new: newReq });
    return newReq;
  },

  async updateCustomRequest(id, updateData) {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('custom_requests')
          .update({ ...updateData, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          notifyChange('custom_requests', { eventType: 'UPDATE', new: data });
          return data;
        }
      } catch (e) {}
    }

    const list = getStored(STORAGE_KEYS.CUSTOM_REQUESTS, initialCustomRequests);
    const index = list.findIndex(r => r.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updateData, updated_at: now };
      setStored(STORAGE_KEYS.CUSTOM_REQUESTS, list);
      notifyChange('custom_requests', { eventType: 'UPDATE', new: list[index] });
      return list[index];
    }
    return null;
  }
};
