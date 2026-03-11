const mongoose = require('mongoose');

// Validate that a value is a non-empty string within max length
function isValidString(val, maxLength = 500) {
  return typeof val === 'string' && val.trim().length > 0 && val.length <= maxLength;
}

// Validate that a value is a safe non-negative integer
function isValidPositiveInt(val, max = 100000) {
  const n = Number(val);
  return Number.isInteger(n) && n >= 0 && n <= max;
}

// Validate MongoDB ObjectId
function isValidObjectId(val) {
  return mongoose.Types.ObjectId.isValid(val);
}

// Validate email format
function isValidEmail(val) {
  if (typeof val !== 'string' || val.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

// Sanitize string input (trim and limit length)
function sanitizeString(val, maxLength = 500) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

// Safe Math.max for arrays (avoids spread operator stack overflow)
function safeMax(arr) {
  if (!arr || arr.length === 0) return 0;
  let max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = Number(arr[i]);
    if (!isNaN(v) && v > max) max = v;
  }
  return max === -Infinity ? 0 : max;
}

module.exports = {
  isValidString,
  isValidPositiveInt,
  isValidObjectId,
  isValidEmail,
  sanitizeString,
  safeMax,
};
