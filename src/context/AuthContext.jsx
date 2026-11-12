import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { db } from '../services/dbBridge';

const AuthContext = createContext(null);
const ADMIN_SESSION_KEY = 'atelier_admin_session_auth';
const CUSTOMER_SESSION_KEY = 'atelier_customer_session_auth';

export const AuthProvider = ({ children }) => {
  // Customer State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  // Admin State
  const [adminUser, setAdminUser] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  // Load customer profile when user changes
  const loadCustomerProfile = async (userId, userEmail) => {
    try {
      let p = await db.getProfile(userId);
      if (!p && isSupabaseConfigured && supabase) {
        // Fallback default profile if not yet created by trigger
        p = {
          id: userId,
          name: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: ''
        };
      }
      setProfile(p);
    } catch (err) {
      console.warn('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    // 1. Restore Admin session from sessionStorage
    try {
      const savedAdmin = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin);
        if (parsed && parsed.email) {
          setAdminUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to restore admin session:', e);
    } finally {
      setLoadingAdmin(false);
    }

    // 2. Check Supabase Auth for Customer session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          await loadCustomerProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoadingCustomer(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadCustomerProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Offline / Local storage fallback for customer
      try {
        const savedCustomer = localStorage.getItem(CUSTOMER_SESSION_KEY);
        if (savedCustomer) {
          const parsed = JSON.parse(savedCustomer);
          if (parsed && parsed.id) {
            setUser(parsed);
            loadCustomerProfile(parsed.id, parsed.email);
          }
        }
      } catch (e) {}
      setLoadingCustomer(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // CUSTOMER AUTH METHODS
  // --------------------------------------------------------------------------
  const customerSignUp = async (email, password, profileDetails = {}) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: profileDetails.name || '',
            phone: profileDetails.phone || '',
            address: profileDetails.address || '',
            city: profileDetails.city || '',
            state: profileDetails.state || '',
            pincode: profileDetails.pincode || ''
          }
        }
      });

      if (error) throw new Error(error.message);

      if (data?.user) {
        setUser(data.user);
        // Explicitly ensure profile is saved in public.profiles table
        const saved = await db.saveProfile(data.user.id, {
          name: profileDetails.name || '',
          phone: profileDetails.phone || '',
          address: profileDetails.address || '',
          city: profileDetails.city || '',
          state: profileDetails.state || '',
          pincode: profileDetails.pincode || ''
        });
        setProfile(saved);
        return data.user;
      }
    } else {
      // Local DB mode
      const mockUser = {
        id: 'cust-' + Date.now().toString(36),
        email: cleanEmail,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      const saved = await db.saveProfile(mockUser.id, profileDetails);
      setProfile(saved);
      return mockUser;
    }
  };

  const customerLogin = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) throw new Error(error.message);

      if (data?.user) {
        setUser(data.user);
        await loadCustomerProfile(data.user.id, data.user.email);
        return data.user;
      }
    } else {
      // Local fallback
      const mockUser = {
        id: 'cust-' + cleanEmail.replace(/[^a-z0-9]/g, ''),
        email: cleanEmail,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      await loadCustomerProfile(mockUser.id, cleanEmail);
      return mockUser;
    }
  };

  const customerLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    setUser(null);
    setProfile(null);
  };

  const customerForgotPassword = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo
      });
      if (error) throw new Error(error.message);
    }
    return true;
  };

  const customerUpdatePassword = async (newPassword) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw new Error(error.message);
    }
    return true;
  };

  const updateCustomerProfile = async (updatedFields) => {
    if (!user) throw new Error('Must be logged in to update profile.');
    const updated = await db.saveProfile(user.id, updatedFields);
    setProfile(updated);
    return updated;
  };

  // --------------------------------------------------------------------------
  // ADMIN AUTH METHODS (STRICTLY CHECK AGAINST admin_users TABLE)
  // --------------------------------------------------------------------------
  const adminLogin = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      const authenticatedUser = data?.user;
      if (!authenticatedUser) {
        throw new Error('Authentication failed.');
      }

      // 2. Strict Admin Role Verification: Being logged in NEVER grants admin access.
      // Must exist in public.admin_users table!
      const isAuthorizedAdmin = await db.checkIsAdmin(authenticatedUser.id, authenticatedUser.email);
      if (!isAuthorizedAdmin) {
        // Sign out immediately
        await supabase.auth.signOut();
        throw new Error('Access Denied: This account is not registered as an authorized store administrator.');
      }

      const adminObj = {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        role: 'admin',
        provider: 'supabase'
      };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminObj));
      setAdminUser(adminObj);
      return adminObj;
    } else {
      // Local fallback mode: check against admin_users registry
      const isAuthorizedAdmin = await db.checkIsAdmin(null, cleanEmail);
      if (!isAuthorizedAdmin) {
        throw new Error('Access Denied: Email is not registered as an authorized store administrator in admin_users.');
      }

      const adminObj = {
        id: 'admin-' + cleanEmail.replace(/[^a-z0-9]/g, ''),
        email: cleanEmail,
        role: 'admin',
        provider: 'local_secure'
      };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminObj));
      setAdminUser(adminObj);
      return adminObj;
    }
  };

  const adminLogout = async () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminUser(null);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        // Customer state & actions
        user,
        profile,
        isCustomerAuthenticated: Boolean(user),
        loadingCustomer,
        customerSignUp,
        customerLogin,
        customerLogout,
        customerForgotPassword,
        customerUpdatePassword,
        updateCustomerProfile,

        // Admin state & actions
        adminUser,
        isAdminAuthenticated: Boolean(adminUser),
        loadingAdmin,
        adminLogin,
        adminLogout,

        // General loading state
        loading: loadingCustomer || loadingAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
