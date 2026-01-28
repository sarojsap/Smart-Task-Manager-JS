// ============================================
// DATE UTILITIES
// ============================================

/**
 * Format a date string to a localized date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or fallback text
 */
export function formatDate(dateString) {
  if (!dateString) return "No date";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date relative to today (Today, Tomorrow, Yesterday, or date)
 * @param {string} dateString - ISO date string
 * @returns {string} Relative date string
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return "No date";

  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date.getTime())) return "Invalid date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) {
    return "Today";
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Check if within this week
  const daysDiff = Math.round((dateOnly - today) / (1000 * 60 * 60 * 24));
  if (daysDiff > 0 && daysDiff <= 7) {
    return date.toLocaleDateString(undefined, { weekday: "long" });
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: today.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Check if a date is today
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export function isToday(dateString) {
  if (!dateString) return false;

  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date falls within this week (next 7 days)
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export function isThisWeek(dateString) {
  if (!dateString) return false;

  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  return date >= today && date <= weekFromNow;
}

/**
 * Check if a date is overdue (before today)
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export function isOverdue(dateString) {
  if (!dateString) return false;

  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date < today;
}

// ============================================
// DEBOUNCE UTILITY
// ============================================

/**
 * Create a debounced version of a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ============================================
// THROTTLE UTILITY
// ============================================

/**
 * Create a throttled version of a function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 300) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// ID GENERATION
// ============================================

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Move an item in an array from one index to another
 * @param {Array} array - The array to modify
 * @param {number} from - Source index
 * @param {number} to - Destination index
 * @returns {Array} Modified array
 */
export function moveArrayItem(array, from, to) {
  const arr = [...array];
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  return arr;
}

// ============================================
// DOM UTILITIES
// ============================================

/**
 * Safely get an element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
export function $(id) {
  return document.getElementById(id);
}

/**
 * Create an element with optional attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes to set
 * @param {Array} children - Child elements or text
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "className") {
      el.className = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }

  children.forEach((child) => {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}
