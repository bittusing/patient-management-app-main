// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Format currency for display
export const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${amount}`;
  }
};

// Validate phone number
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/;
  return phoneRegex.test(phone);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate a random ID with a prefix
export const generateId = (prefix = '') => {
  return `${prefix}${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Deep compare objects
export const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export default {
  formatDate,
  formatCurrency,
  isValidPhoneNumber,
  isValidEmail,
  generateId,
  truncateText,
  isEqual,
}; 