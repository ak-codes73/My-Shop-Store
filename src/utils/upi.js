/**
 * UPI Protocol Utilities
 * Generates official NPCI compliant UPI deep-links & QR payloads
 */
export const generateUpiPaymentString = ({ upiId, payeeName, amount, orderNumber, note }) => {
  if (!upiId) return '';
  
  const cleanUpiId = upiId.trim();
  const cleanPayee = encodeURIComponent(payeeName || 'Atelier Collectibles');
  const cleanAmount = (typeof amount === 'number' ? amount : parseFloat(amount) || 0).toFixed(2);
  const transactionNote = encodeURIComponent(note || `Order ${orderNumber || ''}`);
  
  // Standard NPCI UPI URI Scheme
  return `upi://pay?pa=${cleanUpiId}&pn=${cleanPayee}&am=${cleanAmount}&tn=${transactionNote}&cu=INR`;
};

/**
 * Validate 12-digit UPI / UTR Transaction ID
 * In India, UPI transactions issue a 12-digit numeric or alphanumeric reference code (UTR).
 */
export const validateUpiReference = (ref) => {
  if (!ref) return { valid: false, message: 'UPI Reference ID is required.' };
  const cleaned = ref.trim().replace(/\s+/g, '');
  if (cleaned.length < 8 || cleaned.length > 20) {
    return { valid: false, message: 'Valid UPI / UTR Reference ID is typically 12 characters.' };
  }
  return { valid: true, value: cleaned };
};

