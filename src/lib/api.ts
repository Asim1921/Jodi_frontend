// src/lib/api.ts - Complete Updated Version with Reviews
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
  bonded?: boolean;
  background_checked?: boolean;
  years_in_business?: number;
  employee_count?: number;
  license_number?: string;
  areas_served?: string;
  business_hours?: any;
  distance?: number;
  owner: {
    id: number;
    name: string;
    membership_status: string;
    email?: string;
    phone?: string;
    military_verified?: boolean;
  };
   owner_details: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    membership_status: string;
    military_verified: boolean;
  };
  categories: Array<{
    id: number;
    name: string;
    icon_class: string;
  }>;
  created_at: string;
  updated_at?: string;
}

export interface BusinessCategory {
  id: number;
  name: string;
  description: string;
  icon_class: string;
  businesses_count: number;
  sort_order: number;
  active?: boolean;
  parent_id?: number;
  level?: number;
  requires_license?: boolean;
  emergency_service?: boolean;
  color_code?: string;
  slug?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  role: string;
  membership_status: string;
  active: boolean;
  has_business?: boolean;
  military_verified?: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
 id: number;
  rating: number;
  review_title: string;
  review_text: string;
  service_date: string | null;
  verified_purchase: boolean;
  verified_reviewer: boolean;
  helpful_count: number;
  would_recommend: boolean | null;
  response_time_rating: number | null;
  quality_rating: number | null;
  value_rating: number | null;
  project_cost_range: string | null;
  user: {
    id: number;
    name: string;
    membership_status: string;
    is_verified: boolean | null;
  };
  business_response: string | null;
  business_response_date: string | null;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
  can_delete: boolean;
}

export interface ReviewFormData {
  rating: number;
  review_title: string;
  review_text: string;
  service_date?: string;
  project_cost_range?: string;
  would_recommend?: boolean | null;
  response_time_rating?: number;
  quality_rating?: number;
  value_rating?: number;
  verified_purchase?: boolean;
}

export interface Inquiry {
  id: number;
  business_id: number;
  user_id: number;
  subject?: string;
  message: string;
  contact_phone?: string;
  preferred_contact_method?: string;
  preferred_contact_time?: string;
  status: string;
  business_response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MilitaryBackground {
  id: number;
  user_id: number;
  military_relationship: string;
  branch_of_service?: string;
  rank?: string;
  mos_specialty?: string;
  service_start_date?: string;
  service_end_date?: string;
  additional_info?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
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
      role?: string;
      membership_status?: string;
      // Business owner specific fields
      business_name?: string;
      driver_license?: string;
      dd214_number?: string;
    }) => apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register', { user: userData }),
    
    me: () => apiClient.get<ApiResponse<User>>('/auth/me'),
    
    logout: () => apiClient.delete<ApiResponse>('/auth/logout'),

    forgotPassword: (email: string) =>
      apiClient.post<ApiResponse>('/auth/forgot_password', { email }),

    resetPassword: (token: string, password: string, passwordConfirmation: string) =>
      apiClient.post<ApiResponse>('/auth/reset_password', { 
        user: { 
          reset_password_token: token, 
          password, 
          password_confirmation: passwordConfirmation 
        } 
      }),
  },

  // Users
  users: {
    get: (id: number) =>
      apiClient.get<ApiResponse<{ user: User }>>(`/users/${id}`),
    
    update: (id: number, userData: Partial<User>) =>
      apiClient.patch<ApiResponse<{ user: User }>>(`/users/${id}`, { user: userData }),
    delete: (id: number) =>
      apiClient.delete<ApiResponse>(`/users/${id}`),
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
      emergency_service?: boolean;
      insured?: boolean;
      min_rating?: number;
      user_id?: number;
    }) => apiClient.get<ApiResponse<{ businesses: Business[] }>>('/businesses', { params }),
    
    get: (id: string | number) =>
      apiClient.get<ApiResponse<{ business: Business }>>(`/businesses/${id}`),
    
    create: (businessData: any) =>
      apiClient.post<ApiResponse<{ business: Business }>>('/businesses', { business: businessData }),

    update: (id: number, businessData: Partial<Business>) =>
      apiClient.patch<ApiResponse<{ business: Business }>>(`/businesses/${id}`, { business: businessData }),

    delete: (id: number) =>
      apiClient.delete<ApiResponse>(`/businesses/${id}`),
    
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

    // Business actions
    approve: (id: number) =>
      apiClient.patch<ApiResponse>(`/businesses/${id}/approve`),

    reject: (id: number, reason?: string) =>
      apiClient.patch<ApiResponse>(`/businesses/${id}/reject`, { reason }),

    suspend: (id: number, reason?: string) =>
      apiClient.patch<ApiResponse>(`/businesses/${id}/suspend`, { reason }),

    feature: (id: number) =>
      apiClient.patch<ApiResponse>(`/businesses/${id}/feature`),

    unfeature: (id: number) =>
      apiClient.patch<ApiResponse>(`/businesses/${id}/unfeature`),

    // Inquiries
    createInquiry: (businessId: number, inquiryData: {
      subject?: string;
      message: string;
      contact_phone?: string;
      preferred_contact_method?: string;
      preferred_contact_time?: string;
    }) => apiClient.post<ApiResponse<{ inquiry: Inquiry }>>(`/businesses/${businessId}/inquiries`, { inquiry: inquiryData }),

    getInquiries: (businessId: number, params?: { page?: number; per_page?: number }) =>
      apiClient.get<ApiResponse<{ inquiries: Inquiry[] }>>(`/businesses/${businessId}/inquiries`, { params }),

    updateInquiry: (businessId: number, inquiryId: number, inquiryData: Partial<Inquiry>) =>
      apiClient.patch<ApiResponse<{ inquiry: Inquiry }>>(`/businesses/${businessId}/inquiries/${inquiryId}`, { inquiry: inquiryData }),

    // Legacy Reviews (keeping for backward compatibility)
    getReviews: (businessId: number, params?: { page?: number; per_page?: number }) =>
      apiClient.get<ApiResponse<{ reviews: Review[] }>>(`/businesses/${businessId}/reviews`, { params }),

    createReview: (businessId: number, reviewData: {
      rating: number;
      review_title?: string;
      review_text?: string;
      service_date?: string;
      would_recommend?: boolean;
    }) => apiClient.post<ApiResponse<{ review: Review }>>(`/businesses/${businessId}/reviews`, { review: reviewData }),

    updateReview: (businessId: number, reviewId: number, reviewData: Partial<Review>) =>
      apiClient.patch<ApiResponse<{ review: Review }>>(`/businesses/${businessId}/reviews/${reviewId}`, { review: reviewData }),

    deleteReview: (businessId: number, reviewId: number) =>
      apiClient.delete<ApiResponse>(`/businesses/${businessId}/reviews/${reviewId}`),
  },

  // Business Categories
  categories: {
    list: () => apiClient.get<ApiResponse<{ categories: BusinessCategory[] }>>('/business_categories'),
    
    get: (id: number) =>
      apiClient.get<ApiResponse<{ category: BusinessCategory }>>(`/business_categories/${id}`),
    
    businesses: (id: number, params?: { page?: number; per_page?: number }) =>
      apiClient.get<ApiResponse<{ businesses: Business[] }>>(`/business_categories/${id}/businesses`, { params }),

    create: (categoryData: Partial<BusinessCategory>) =>
      apiClient.post<ApiResponse<{ category: BusinessCategory }>>('/business_categories', { category: categoryData }),

    update: (id: number, categoryData: Partial<BusinessCategory>) =>
      apiClient.patch<ApiResponse<{ category: BusinessCategory }>>(`/business_categories/${id}`, { category: categoryData }),

    delete: (id: number) =>
      apiClient.delete<ApiResponse>(`/business_categories/${id}`),
  },

  // Reviews (New dedicated section)
  reviews: {
    list: (businessId: number, params?: {
      page?: number;
      per_page?: number;
      rating?: number;
      verified?: boolean;
      sort_by?: string;
    }) => apiClient.get<ApiResponse<{ 
      reviews: Review[]; 
      statistics: any; 
      meta: any;
    }>>(`/businesses/${businessId}/reviews`, { params }),
    
    get: (businessId: number, reviewId: number) =>
      apiClient.get<ApiResponse<{ review: Review }>>(`/businesses/${businessId}/reviews/${reviewId}`),
    
    create: (businessId: number, reviewData: ReviewFormData) =>
      apiClient.post<ApiResponse<{ review: Review }>>(`/businesses/${businessId}/reviews`, { review: reviewData }),
    
    update: (businessId: number, reviewId: number, reviewData: Partial<ReviewFormData>) =>
      apiClient.patch<ApiResponse<{ review: Review }>>(`/businesses/${businessId}/reviews/${reviewId}`, { review: reviewData }),
    
    delete: (businessId: number, reviewId: number) =>
      apiClient.delete<ApiResponse>(`/businesses/${businessId}/reviews/${reviewId}`),
    
    helpful: (businessId: number, reviewId: number) =>
      apiClient.post<ApiResponse<{ helpful_count: number }>>(`/businesses/${businessId}/reviews/${reviewId}/helpful`),
    
    report: (businessId: number, reviewId: number, reason: string, details?: string) =>
      apiClient.post<ApiResponse>(`/businesses/${businessId}/reviews/${reviewId}/report`, { reason, details }),
  },

  // Military Backgrounds
  militaryBackgrounds: {
    get: (userId: number) =>
      apiClient.get<ApiResponse<{ military_background: any }>>(`/users/${userId}/military_background`),
    
    create: (userId: number, data: any) =>
      apiClient.post<ApiResponse<{ military_background: any }>>(`/users/${userId}/military_background`, { military_background: data }),
    
    update: (userId: number, data: any) =>
      apiClient.patch<ApiResponse<{ military_background: any }>>(`/users/${userId}/military_background`, { military_background: data }),
    
    delete: (userId: number) =>
      apiClient.delete<ApiResponse>(`/users/${userId}/military_background`),
  },

  // Search
  search: {
    businesses: (params: {
      query?: string;
      location?: string;
      category_ids?: number[];
      radius?: number;
      filters?: any;
      sort_by?: string;
      page?: number;
      per_page?: number;
    }) => apiClient.get<ApiResponse<{ businesses: Business[] }>>('/search/businesses', { params }),

    autocomplete: (params: { q: string; location?: string }) =>
      apiClient.get<ApiResponse<{ suggestions: any[] }>>('/search/autocomplete', { params }),

    suggestions: (params?: { location?: string }) =>
      apiClient.get<ApiResponse<any>>('/search/suggestions', { params }),

    saveSearch: (searchData: {
      search_name: string;
      search_params: any;
      email_notifications?: boolean;
      notification_frequency?: number;
    }) => apiClient.post<ApiResponse>('/search/save_search', { saved_search: searchData }),

    getSavedSearches: () =>
      apiClient.get<ApiResponse<{ saved_searches: any[] }>>('/search/saved_searches'),

    deleteSavedSearch: (id: number) =>
      apiClient.delete<ApiResponse>(`/search/saved_searches/${id}`),
  },

  // Geo Services
  geo: {
    states: () =>
      apiClient.get<ApiResponse<{ states: any[] }>>('/geo/states'),

    cities: (state?: string) =>
      apiClient.get<ApiResponse<{ cities: any[] }>>('/geo/cities', { params: { state } }),

    zipCodes: (state?: string, city?: string) =>
      apiClient.get<ApiResponse<{ zip_codes: string[] }>>('/geo/zip_codes', { params: { state, city } }),

    geocode: (address: string) =>
      apiClient.post<ApiResponse<{ location: any }>>('/geo/geocode', { address }),

    reverseGeocode: (latitude: number, longitude: number) =>
      apiClient.post<ApiResponse<{ location: any }>>('/geo/reverse_geocode', { latitude, longitude }),

    serviceAreas: (businessId?: number, location?: string) =>
      apiClient.get<ApiResponse<{ service_areas: string[] }>>('/geo/service_areas', { params: { business_id: businessId, location } }),
  },

  // Public APIs (no auth required)
  public: {
    featured: () => apiClient.get<ApiResponse<{ businesses: Business[] }>>('/public/businesses/featured'),
    
    search: (params: { q?: string; category_ids?: number[] }) =>
      apiClient.get<ApiResponse<{ businesses: Business[] }>>('/public/businesses/search', { params }),
    
    statistics: () => apiClient.get<ApiResponse<{
      totalBusinesses: number;
      totalVeterans: number;
      totalCategories: number;
      totalReviews: number;
    }>>('/public/statistics'),

    categories: () => apiClient.get<ApiResponse<{ categories: BusinessCategory[] }>>('/public/businesses/categories'),

    serviceAreas: () => apiClient.get<ApiResponse<{ service_areas: string[] }>>('/public/service_areas'),
  },

  // Admin APIs
  admin: {
    dashboard: () =>
      apiClient.get<ApiResponse<any>>('/admin/dashboard'),

    analytics: () =>
      apiClient.get<ApiResponse<any>>('/admin/analytics'),

    reports: () =>
      apiClient.get<ApiResponse<any>>('/admin/reports'),

    users: {
      list: (params?: { page?: number; per_page?: number; role?: string; status?: string }) =>
        apiClient.get<ApiResponse<{ users: User[] }>>('/admin/users', { params }),

      get: (id: number) =>
        apiClient.get<ApiResponse<{ user: User }>>(`/admin/users/${id}`),

      activate: (id: number) =>
        apiClient.patch<ApiResponse>(`/admin/users/${id}/activate`),

      deactivate: (id: number) =>
        apiClient.patch<ApiResponse>(`/admin/users/${id}/deactivate`),

      verifyMilitary: (id: number) =>
        apiClient.patch<ApiResponse>(`/admin/users/${id}/verify_military`),
    },

    businesses: {
      list: (params?: { page?: number; per_page?: number; status?: string }) =>
        apiClient.get<ApiResponse<{ businesses: Business[] }>>('/admin/businesses', { params }),

      pendingApproval: () =>
        apiClient.get<ApiResponse<{ businesses: Business[] }>>('/admin/businesses/pending_approval'),

      verificationQueue: () =>
        apiClient.get<ApiResponse<{ businesses: Business[] }>>('/admin/businesses/verification_queue'),

      bulkApprove: (ids: number[]) =>
        apiClient.post<ApiResponse>('/admin/businesses/bulk_approve', { business_ids: ids }),

      bulkReject: (ids: number[], reason?: string) =>
        apiClient.post<ApiResponse>('/admin/businesses/bulk_reject', { business_ids: ids, reason }),
    },

    data: {
      importBusinesses: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post<ApiResponse>('/admin/data/import_businesses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      },

      exportBusinesses: () =>
        apiClient.get('/admin/data/export_businesses', { responseType: 'blob' }),

      scrapeVeteranDirectory: (options?: { states?: string[]; limit?: number }) =>
        apiClient.post<ApiResponse>('/admin/data/scrape_veteran_directory', options),

      scrapingStatus: () =>
        apiClient.get<ApiResponse>('/admin/data/scraping_status'),
    },
  },

  // File uploads
  uploads: {
    businessImages: (businessId: number, files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('images[]', file));
      return apiClient.post<ApiResponse>(`/uploads/business_images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { business_id: businessId }
      });
    },

    businessDocuments: (businessId: number, files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('documents[]', file));
      return apiClient.post<ApiResponse>(`/uploads/business_documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { business_id: businessId }
      });
    },

    certifications: (businessId: number, files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('certifications[]', file));
      return apiClient.post<ApiResponse>(`/uploads/certifications`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { business_id: businessId }
      });
    },

    removeFile: (fileId: number) =>
      apiClient.delete<ApiResponse>(`/uploads/remove_file/${fileId}`),
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