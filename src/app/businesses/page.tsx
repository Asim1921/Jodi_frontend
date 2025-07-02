// src/app/businesses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  MapIcon,
  ListBulletIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Business, BusinessCategory } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BusinessCard } from '@/components/business/business-card';
import { SearchBar } from '@/components/search/search-bar';
import { BusinessFilters } from '@/app/businesses/business-filters';
import { BusinessMap } from '@/components/business/business-map';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Pagination } from '@/components/ui/pagination';

export default function BusinessesPage() {
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    perPage: 20
  });

  const [filters, setFilters] = useState({
    category_ids: searchParams.get('category') ? [parseInt(searchParams.get('category')!)] : [],
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    verified: searchParams.get('verified') === 'true',
    featured: searchParams.get('featured') === 'true',
    military_owned: searchParams.get('military_owned') === 'true',
    emergency_service: searchParams.get('emergency_service') === 'true',
    insured: searchParams.get('insured') === 'true',
    min_rating: searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined,
    sort_by: searchParams.get('sort_by') || 'relevance'
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [searchParams, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: parseInt(searchParams.get('page') || '1'),
        per_page: 20,
        ...filters
      };

      const response = await api.businesses.list(params);
      setBusinesses(response.data.data.businesses || []);
      
      if (response.data.meta) {
        setPagination({
          currentPage: response.data.meta.current_page,
          totalPages: response.data.meta.total_pages,
          totalCount: response.data.meta.total_count,
          perPage: response.data.meta.per_page
        });
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.categories.list();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      category_ids: [],
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

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value !== '' && value !== 'relevance';
      if (typeof value === 'number') return true;
      return false;
    }).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Veteran Business Directory
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse and connect with trusted military veteran-owned businesses across all categories
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar 
              showLocation={true}
              placeholder="Search for services or businesses..."
            />
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span>{pagination.totalCount} verified businesses</span>
            <span>•</span>
            <span>All 50 states covered</span>
            <span>•</span>
            <span>Military veteran owned</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="lg:flex lg:gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <BusinessFilters
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              {/* Mobile Filter Toggle */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden btn-secondary flex items-center gap-2"
                >
                  <FunnelIcon className="h-4 w-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                <div className="hidden sm:block text-sm text-gray-600">
                  Showing {businesses.length} of {pagination.totalCount} businesses
                </div>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange({ sort_by: e.target.value })}
                  className="form-select text-sm"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="name">Name A-Z</option>
                  <option value="membership">Military Priority</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <MapIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mb-6 border border-gray-200 rounded-lg bg-white p-4"
                >
                  <BusinessFilters
                    categories={categories}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    compact={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            {loading ? (
              <LoadingSkeleton type="business-grid" />
            ) : viewMode === 'list' ? (
              <div className="space-y-8">
                {/* Business Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {businesses.map((business, index) => (
                    <motion.div
                      key={business.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <BusinessCard business={business} />
                    </motion.div>
                  ))}
                </div>

                {/* Empty State */}
                {businesses.length === 0 && (
                  <div className="text-center py-12">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No businesses found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search criteria
                    </p>
                    <button
                      onClick={clearFilters}
                      className="btn-primary"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {businesses.length > 0 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalCount={pagination.totalCount}
                    perPage={pagination.perPage}
                    onPageChange={(page) => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('page', page.toString());
                      window.history.pushState({}, '', url.toString());
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}
              </div>
            ) : (
              /* Map View */
              <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
                <BusinessMap businesses={businesses} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}