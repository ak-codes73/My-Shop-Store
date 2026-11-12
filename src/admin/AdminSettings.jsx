import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Save, Upload, Smartphone, DollarSign, Truck, AlertCircle, 
  Check, RefreshCw, Sparkles, MessageCircle, Instagram, Mail, Phone 
} from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { uploadFile } from '../services/storageService';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import { generateUpiPaymentString } from '../utils/upi';

export const AdminSettings = () => {
  const { settings, updateSettings } = useStoreSettings();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    store_name: '',
    tagline: '',
    upi_id: '',
    upi_payee_name: '',
    upi_qr_url: '',
    delivery_charge: 99,
    free_delivery_threshold: 999,
    payment_instructions: '',
    contact_email: '',
    contact_phone: '',
    whatsapp_number: '',
    instagram_handle: '',
    announcement_text: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        store_name: settings.store_name || 'ATELIER & CO.',
        tagline: settings.tagline || 'Curated Wall Art & Precision Die-Cast Collectibles',
        upi_id: settings.upi_id || 'atelier.store@okaxis',
        upi_payee_name: settings.upi_payee_name || 'Atelier Art & Collectibles',
        upi_qr_url: settings.upi_qr_url || '',
        delivery_charge: settings.delivery_charge !== undefined ? settings.delivery_charge : 99,
        free_delivery_threshold: settings.free_delivery_threshold !== undefined ? settings.free_delivery_threshold : 999,
        payment_instructions: settings.payment_instructions || '',
        contact_email: settings.contact_email || 'support@ateliercollectibles.com',
        contact_phone: settings.contact_phone || '+91 98765 43210',
        whatsapp_number: settings.whatsapp_number || '919876543210',
        instagram_handle: settings.instagram_handle || '@atelier.art.cars',
        announcement_text: settings.announcement_text || 'Discover your next favourite collectible. Free Express Shipping on orders over ₹999!'
      });
    }
  }, [settings]);

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadFile(file, 'store-assets');
      setFormData((prev) => ({ ...prev, upi_qr_url: url }));
      success('Custom QR code image uploaded.');
    } catch (err) {
      error(err.message || 'Failed to upload QR code.');
    }
  };

  const handleRemoveQr = () => {
    setFormData((prev) => ({ ...prev, upi_qr_url: '' }));
    success('Removed custom QR. System will dynamically render real-time vector QR code.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.upi_id.trim()) {
      error('UPI ID is required for payments.');
      return;
    }

    setLoading(true);
    try {
      await updateSettings({
        ...formData,
        delivery_charge: parseFloat(formData.delivery_charge) || 0,
        free_delivery_threshold: parseFloat(formData.free_delivery_threshold) || 0
      });
      success('Store and UPI payment settings saved successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to update store settings.');
    } finally {
      setLoading(false);
    }
  };

  // Sample dynamic UPI URI for preview
  const previewUri = generateUpiPaymentString({
    upiId: formData.upi_id || 'atelier.store@okaxis',
    payeeName: formData.upi_payee_name || 'Atelier Collectibles',
    amount: 999,
    orderNumber: 'ORD-SAMPLE',
    note: 'Sample Order Payment'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-muted">
          Store Configuration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
          UPI Payment & Store Settings
        </h1>
        <p className="text-xs text-muted mt-1">
          Configure payment receiver details, QR code presentation, delivery thresholds, and announcement headers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: UPI Payment Settings */}
        <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft space-y-6">
          <div className="border-b border-border-light pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-charcoal">
                1. UPI Payment Integration & QR Code
              </h2>
              <p className="text-xs text-muted">
                These settings drive the customer payment screen and QR payload.
              </p>
            </div>
            <Smartphone className="w-5 h-5 text-accent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Store UPI ID (VPA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  placeholder="e.g. atelier.store@okaxis"
                  className="w-full font-mono text-xs font-bold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                />
                <p className="text-[11px] text-muted">
                  Must be a valid VPA registered with your bank / UPI provider.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Payee Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.upi_payee_name}
                  onChange={(e) => setFormData({ ...formData, upi_payee_name: e.target.value })}
                  placeholder="e.g. Atelier Art & Collectibles"
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                />
              </div>

              {/* Upload QR Image or keep Dynamic Vector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Custom Static QR Code Image (Optional)
                </label>
                <p className="text-[11px] text-muted">
                  If left empty, the application automatically generates a dynamic vector QR code encoded with the customer&rsquo;s exact order amount.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-cream-100 hover:bg-cream-200 border border-border-light text-charcoal rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Standee / QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQrUpload}
                    />
                  </label>

                  {formData.upi_qr_url && (
                    <button
                      type="button"
                      onClick={handleRemoveQr}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Use Dynamic Vector QR Instead
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Live Preview */}
            <div className="bg-cream-50 p-6 rounded-2xl border border-border-light flex flex-col items-center text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Live QR Preview
              </span>

              <div className="p-3 bg-white rounded-xl border border-border-light shadow-sm">
                {formData.upi_qr_url ? (
                  <img
                    src={formData.upi_qr_url}
                    alt="Uploaded QR"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                ) : (
                  <QRCodeSVG value={previewUri} size={160} level="H" />
                )}
              </div>

              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-charcoal block">
                  {formData.upi_id || 'your-upi-id@bank'}
                </span>
                <span className="text-[10px] text-muted block">
                  {formData.upi_qr_url ? 'Custom Image QR Active' : 'Dynamic Exact-Amount QR Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="space-y-1.5 pt-4 border-t border-border-light">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
              Payment Instructions for Customers
            </label>
            <textarea
              rows={4}
              value={formData.payment_instructions}
              onChange={(e) => setFormData({ ...formData, payment_instructions: e.target.value })}
              className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl p-3 outline-none focus:border-charcoal leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Shipping & Delivery Charges */}
        <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft space-y-6">
          <div className="border-b border-border-light pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-charcoal">
                2. Shipping & Delivery Charges
              </h2>
              <p className="text-xs text-muted">
                Configure pan-India shipping fees and free delivery threshold.
              </p>
            </div>
            <Truck className="w-5 h-5 text-accent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Standard Shipping Charge (INR)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.delivery_charge}
                onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                className="w-full text-xs font-bold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
              />
              <p className="text-[11px] text-muted">Applied when subtotal is below threshold.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Free Delivery Threshold (INR)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.free_delivery_threshold}
                onChange={(e) => setFormData({ ...formData, free_delivery_threshold: e.target.value })}
                className="w-full text-xs font-bold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
              />
              <p className="text-[11px] text-muted">Orders at or above this amount receive FREE delivery.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Store Information & Announcement Bar */}
        <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft space-y-6">
          <div className="border-b border-border-light pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-charcoal">
                3. Store Identity & Announcement Bar
              </h2>
              <p className="text-xs text-muted">
                Public branding, announcement message, and contact channels.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-accent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Announcement Bar Headline
              </label>
              <input
                type="text"
                value={formData.announcement_text}
                onChange={(e) => setFormData({ ...formData, announcement_text: e.target.value })}
                className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Store Name
              </label>
              <input
                type="text"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Store Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Support Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                WhatsApp Number (With Country Code)
              </label>
              <input
                type="text"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="e.g. 919876543210"
                className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 bg-charcoal text-white rounded-xl text-xs uppercase font-extrabold tracking-widest hover:bg-black transition-all shadow-md disabled:bg-cream-300 disabled:text-muted"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

