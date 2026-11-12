import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/dbBridge';
import { initialSettings } from '../data/initialSettings';

const StoreSettingsContext = createContext(null);

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await db.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes on store_settings table
    const unsubscribe = db.subscribe('store_settings', (payload) => {
      if (payload?.new) {
        setSettings(payload.new);
      } else {
        fetchSettings();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const updateSettings = async (newValues) => {
    const updated = await db.updateSettings(newValues);
    setSettings(updated);
    return updated;
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, loading, updateSettings, refetch: fetchSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};

