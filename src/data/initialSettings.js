export const initialSettings = {
  id: 'store-settings-default',
  store_name: 'ATELIER & CO.',
  tagline: 'Curated Wall Art & Precision Die-Cast Collectibles',
  upi_id: 'atelier.store@okaxis',
  upi_payee_name: 'Atelier Art & Collectibles',
  upi_qr_url: '', // Left blank to dynamically generate payment QR with exact order amount!
  delivery_charge: 99,
  free_delivery_threshold: 999,
  payment_instructions: `1. Open any UPI application (Google Pay, PhonePe, Paytm, BHIM, CRED).
2. Scan the dynamic QR code displayed or use our UPI ID.
3. Pay the EXACT order amount specified.
4. Copy the 12-digit UPI Reference Number / UTR ID from your payment receipt.
5. Upload a screenshot (optional but speeds up verification) and submit.
6. Orders will be verified and dispatched within 24-48 hours.`,
  contact_email: 'support@ateliercollectibles.com',
  contact_phone: '+91 98765 43210',
  instagram_handle: '@atelier.art.cars',
  whatsapp_number: '919876543210',
  announcement_text: 'Discover your next favourite collectible. Free Express Shipping on orders over ₹999!',
  updated_at: new Date().toISOString()
};

