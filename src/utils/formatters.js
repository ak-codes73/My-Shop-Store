/**
 * Format currency into Indian Rupees (INR)
 */
export const formatCurrency = (amount) => {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numeric);
};

/**
 * Format date timestamp
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

/**
 * Generate unique Order ID: ORD-YYYYMMDD-XXXX
 */
export const generateOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Generate generic unique ID
 */
export const generateId = (prefix = 'item') => {
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
};

/**
 * Truncate long strings
 */
export const truncate = (text, maxLength = 60) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

