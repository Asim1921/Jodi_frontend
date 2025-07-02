// src/lib/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token on 401
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}
export interface Business {
  id: number;
  business_name: string;
  slug: string;
  description: string;
  business_phone: string;
  business_email: string;
  website_url?: string;
  full_address: string;
  city: string;
  state: string;
  zip_code?: string;
  address_line1?: string;
  address_line2?: string;
  latitude?: number;
  longitude?: number;
  average_rating: number;
  total_reviews: number;
  featured: boolean;
  verified: boolean;
  military_owned: boolean;
  business_status: string;
  emergency_service: boolean;
  insured: boolean;
  distance?: number;
  owner: {
    name: string;
    membership_status: string;
  };
  categories: Array<{
    id: number;
    name: string;
    icon_class: string;
  }>;
  created_at: string;
}

export interface BusinessCategory {
  id: number;
  name: string;
  description: string;
  icon_class: string;
  businesses_count: number;
  sort_order: number;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  membership_status: string;
  active: boolean;
}

// API Functions
export const api = {
  // Authentication
  auth: {
    login: (email: string, password: string) =>
      apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password }),
    
    register: (userData: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      phone?: string;
    }) => apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register', { user: userData }),
    
    me: () => apiClient.get<ApiResponse<User>>('/auth/me'),
    
    logout: () => apiClient.delete<ApiResponse>('/auth/logout'),
  },

  // Businesses
  businesses: {
    list: (params?: {
      page?: number;
      per_page?: number;
      sort_by?: string;
      category_ids?: number[];
      state?: string;
      city?: string;
      verified?: boolean;
      featured?: boolean;
      military_owned?: boolean;
    }) => apiClient.get<ApiResponse<{ businesses: Business[] }>>('/businesses', { params }),
    
    get: (id: string | number) =>
      apiClient.get<ApiResponse<{ business: Business }>>(`/businesses/${id}`),
    
    search: (params: {
      q?: string;
      latitude?: number;
      longitude?: number;
      radius?: number;
      category_ids?: number[];
      state?: string;
      city?: string;
      verified?: boolean;
      featured?: boolean;
      emergency_service?: boolean;
      insured?: boolean;
      military_owned?: boolean;
      min_rating?: number;
      sort_by?: string;
      page?: number;
      per_page?: number;
    }) => apiClient.get<ApiResponse<{ businesses: Business[] }>>('/businesses/search', { params }),
    
    nearby: (params: {
      latitude: number;
      longitude: number;
      radius?: number;
      category_ids?: number[];
      emergency_service?: boolean;
      insured?: boolean;
      page?: number;
      per_page?: number;
    }) => apiClient.get<ApiResponse<{ businesses: Business[] }>>('/businesses/nearby', { params }),
    
    featured: (params?: {
      page?: number;
      per_page?: number;
    }) => apiClient.get<ApiResponse<{ businesses: Business[] }>>('/businesses/featured', { params }),
  },

  // Business Categories
  categories: {
    list: () => apiClient.get<ApiResponse<{ categories: BusinessCategory[] }>>('/business_categories'),
    
    get: (id: number) =>
      apiClient.get<ApiResponse<{ category: BusinessCategory }>>(`/business_categories/${id}`),
    
    businesses: (id: number, params?: { page?: number; per_page?: number }) =>
      apiClient.get<ApiResponse<{ businesses: Business[] }>>(`/business_categories/${id}/businesses`, { params }),
  },

  // Public APIs
  public: {
    featured: () => apiClient.get<ApiResponse<{ businesses: Business[] }>>('/public/businesses/featured'),
    
    search: (params: { q?: string; category_ids?: number[] }) =>
      apiClient.get<ApiResponse<{ businesses: Business[] }>>('/public/businesses/search', { params }),
    
    statistics: () => apiClient.get<ApiResponse<any>>('/public/statistics'),
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export default apiClient;