// src/app/categories/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  MapIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { api, BusinessCategory, Business } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BusinessCard } from '@/components/business/business-card';
import { SearchBar } from '@/components/search/search-bar';

interface Filters {
  category_ids: number[];
  state: string;
  city: string;
  verified: boolean;
  featured: boolean;
  military_owned: boolean;
  emergency_service: boolean;
  insured: boolean;
  min_rating?: number;
  sort_by: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
}

// Business Filters Component
function BusinessFilters({ 
  categories, 
  filters, 
  onFilterChange, 
  onClearFilters 
}: {
  categories: BusinessCategory[];
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
}) {
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'category_ids' || key === 'sort_by') return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value !== '';
    if (typeof value === 'number') return true;
    return false;
  }).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Location
          </label>
          <div className="space-y-3">
            <select
              value={filters.state}
              onChange={(e) => onFilterChange({ state: e.target.value })}
              className="form-select w-full"
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => onFilterChange({ city: e.target.value })}
              className="form-input w-full"
            />
          </div>
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Business Type
          </label>
          <div className="space-y-2">
            {[
              { key: 'verified', label: 'Verified Businesses' },
              { key: 'featured', label: 'Featured Businesses' },
              { key: 'military_owned', label: 'Military Owned' },
              { key: 'emergency_service', label: 'Emergency Service' },
              { key: 'insured', label: 'Insured' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters[key as keyof Filters] as boolean}
                  onChange={(e) => onFilterChange({ [key]: e.target.checked })}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Minimum Rating
          </label>
          <select
            value={filters.min_rating || ''}
            onChange={(e) => onFilterChange({ min_rating: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="form-select w-full"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="3.0">3.0+ Stars</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Sort By
          </label>
          <select
            value={filters.sort_by}
            onChange={(e) => onFilterChange({ sort_by: e.target.value })}
            className="form-select w-full"
          >
            <option value="relevance">Most Relevant</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
            <option value="membership">Military Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-32 w-full rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="business-card">
            <div className="skeleton h-48 w-full mb-4"></div>
            <div className="p-6">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
          disabled={typeof page !== 'number'}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            page === currentPage
              ? 'text-white bg-primary-600 border border-primary-600'
              : typeof page === 'number'
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              : 'text-gray-400 cursor-default'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<BusinessCategory | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [allCategories, setAllCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    perPage: 20
  });

  const [filters, setFilters] = useState<Filters>({
    category_ids: [parseInt(params.id as string)],
    state: '',
    city: '',
    verified: false,
    featured: false,
    military_owned: false,
    emergency_service: false,
    insured: false,
    min_rating: undefined,
    sort_by: 'relevance'
  });

  useEffect(() => {
    fetchCategoryAndBusinesses();
    fetchAllCategories();
  }, [params.id]);

  useEffect(() => {
    if (category) {
      fetchBusinesses();
    }
  }, [filters, pagination.currentPage, category]);

  const fetchCategoryAndBusinesses = async () => {
    setLoading(true);
    try {
      const categoryResponse = await api.categories.get(parseInt(params.id as string));
      setCategory(categoryResponse.data.data.category);
      
      // Reset filters when category changes
      setFilters(prev => ({
        ...prev,
        category_ids: [parseInt(params.id as string)]
      }));
      
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    } catch (error) {
      console.error('Error fetching category:', error);
      router.push('/categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const response = await api.categories.list();
      setAllCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBusinesses = async () => {
    if (!category) return;
    
    setBusinessesLoading(true);
    try {
      const response = await api.categories.businesses(category.id, {
        page: pagination.currentPage,
        per_page: pagination.perPage
      });

      setBusinesses(response.data.data.businesses || []);
      
      if (response.data.meta) {
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.meta!.current_page,
          totalPages: response.data.meta!.total_pages,
          totalCount: response.data.meta!.total_count
        }));
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setBusinessesLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ 
      ...prev, 
      ...newFilters,
      category_ids: [parseInt(params.id as string)] // Always keep current category
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category_ids: [parseInt(params.id as string)],
      state: '',
      city: '',
      verified: false,
      featured: false,
      military_owned: false,
      emergency_service: false,
      insured: false,
      min_rating: undefined,
      sort_by: 'relevance'
    });
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const relatedCategories = allCategories
    .filter(cat => cat.id !== category?.id)
    .slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-8">
          <LoadingSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-8">
          <div className="text-center">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
            <Link href="/categories" className="btn-primary">
              Browse All Categories
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Category Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/categories" className="hover:text-primary-600">Categories</Link>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <Link 
                  href="/categories"
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <div className="flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-lg mr-4">
                  <i className={`${category.icon_class || 'fas fa-briefcase'} text-2xl`}></i>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900">
                    {category.name}
                  </h1>
                  <p className="text-lg text-gray-600 mt-2 max-w-2xl">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  <span>{pagination.totalCount} businesses</span>
                </div>
                <span>•</span>
                <span>Veteran-owned services</span>
                <span>•</span>
                <span>Verified professionals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-gray-100 border-b border-gray-200">
        <div className="container-custom py-6">
          <SearchBar 
            placeholder={`Search ${category.name.toLowerCase()} services...`}
            showLocation={true}
            className="max-w-3xl mx-auto"
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="lg:flex lg:gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <BusinessFilters
                categories={allCategories}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
                {Object.values(filters).some(v => typeof v === 'boolean' ? v : v !== '' && v !== undefined) && (
                  <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </button>
              
              {showFilters && (
                <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <BusinessFilters
                    categories={allCategories}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                  />
                </div>
              )}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {businessesLoading ? 'Searching...' : `${pagination.totalCount} businesses found`}
                </h2>
                <p className="text-gray-600">
                  Showing page {pagination.currentPage} of {pagination.totalPages}
                </p>
              </div>
            </div>

            {/* Business Grid */}
            {businessesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="business-card">
                    <div className="skeleton h-48 w-full mb-4"></div>
                    <div className="p-6">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-text"></div>
                      <div className="skeleton-text"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : businesses.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {businesses.map((business, index) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <BusinessCard business={business} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No businesses found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search in a different area.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Categories */}
        {relatedCategories.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedCategories.map((relatedCategory) => (
                <Link
                  key={relatedCategory.id}
                  href={`/categories/${relatedCategory.id}`}
                  className="group block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-lg mb-3 group-hover:bg-primary-200 transition-colors duration-200">
                      <i className={`${relatedCategory.icon_class} text-lg`}></i>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                      {relatedCategory.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {relatedCategory.businesses_count} businesses
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}