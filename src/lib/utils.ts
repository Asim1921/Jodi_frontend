// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId?: string, config?: any) => void;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a US phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if not a standard format
}

// Distance formatting
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 5280).toFixed(0)} ft`;
  }
  return `${distance.toFixed(1)} mi`;
}

// Address formatting
export function formatAddress(business: {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}): string {
  const parts = [
    business.address_line1,
    business.address_line2,
    business.city,
    business.state,
    business.zip_code
  ].filter(Boolean);
  
  return parts.join(', ');
}

// Date formatting
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

// Rating utilities
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-yellow-600';
  if (rating >= 3.0) return 'text-orange-600';
  return 'text-red-600';
}

// URL utilities
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function addHttps(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

// Search utilities
export function highlightSearchTerm(text: string, term: string): string {
  if (!term || !text) return text;
  
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned);
}

export function isValidZipCode(zip: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Local storage utilities (with SSR safety)
export function getLocalStorage(key: string, defaultValue: any = null) {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setLocalStorage(key: string, value: any) {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

export function removeLocalStorage(key: string) {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

// Price formatting
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

// Color utilities
export function getMembershipColor(status: string): string {
  const colors: Record<string, string> = {
    veteran: 'bg-military-100 text-military-800',
    spouse: 'bg-purple-100 text-purple-800',
    member: 'bg-blue-100 text-blue-800',
    supporter: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || colors.supporter;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || colors.pending;
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Analytics utilities
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
      page_location: url,
    });
  }
}