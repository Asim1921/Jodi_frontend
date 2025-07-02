// src/app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Business, BusinessCategory } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BusinessCard } from '@/components/business/business-card';
import { SearchBar } from '@/components/search/search-bar';
import { BusinessFilters } from '@/app/businesses/business-filters';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Pagination } from '@/components/ui/pagination';
import { debounce } from '@/lib/utils';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
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

  const [searchMeta, setSearchMeta] = useState({
    searchTime: 0,
    suggestions: [] as string[],
    correctedQuery: ''
  });

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('recent_searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  useEffect(() => {
    if (searchQuery || Object.values(filters).some(v => v && v !== 'relevance')) {
      performSearch();
    }
    fetchCategories();
  }, [searchParams, filters]);

  const performSearch = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const params = {
        q: searchQuery,
        location: searchLocation,
        page: parseInt(searchParams.get('page') || '1'),
        per_page: 20,
        ...filters
      };

      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] === '' || 
            params[key as keyof typeof params] === undefined ||
            (Array.isArray(params[key as keyof typeof params]) && 
             (params[key as keyof typeof params] as any[]).length === 0)) {
          delete params[key as keyof typeof params];
        }
      });

      const response = await api.businesses.search(params);
      const searchTime = Date.now() - startTime;
      
      setBusinesses(response.data.data.businesses || []);
      setSearchMeta(prev => ({ 
        ...prev, 
        searchTime: searchTime / 1000,
        // Add mock suggestions/corrections for demo
        suggestions: searchQuery ? [`${searchQuery} services`, `${searchQuery} near me`] : [],
        correctedQuery: ''
      }));
      
      if (response.data.meta) {
        setPagination({
          currentPage: response.data.meta.current_page,
          totalPages: response.data.meta.total_pages,
          totalCount: response.data.meta.total_count,
          perPage: response.data.meta.per_page
        });
      }

      // Save search to recent searches
      if (searchQuery && !recentSearches.includes(searchQuery)) {
        const newRecentSearches = [searchQuery, ...recentSearches].slice(0, 5);
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recent_searches', JSON.stringify(newRecentSearches));
      }
    } catch (error) {
      console.error('Search error:', error);
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

  const handleSearch = (query: string, location?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    
    // Add current filters to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'relevance') {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (typeof value === 'boolean' && value) {
          params.set(key, 'true');
        } else if (typeof value === 'string' && value !== '') {
          params.set(key, value);
        } else if (typeof value === 'number') {
          params.set(key, value.toString());
        }
      }
    });

    router.push(`/search?${params.toString()}`);
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

  const clearSearch = () => {
    setSearchQuery('');
    setSearchLocation('');
    router.push('/search');
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

  const ActiveFilters = () => {
    const activeFilters = [];
    
    if (searchQuery) activeFilters.push({ type: 'search', value: searchQuery, label: `"${searchQuery}"` });
    if (searchLocation) activeFilters.push({ type: 'location', value: searchLocation, label: `📍 ${searchLocation}` });
    if (filters.category_ids.length > 0) {
      const categoryNames = categories
        .filter(cat => filters.category_ids.includes(cat.id))
        .map(cat => cat.name);
      activeFilters.push({ type: 'categories', value: filters.category_ids, label: categoryNames.join(', ') });
    }
    if (filters.state) activeFilters.push({ type: 'state', value: filters.state, label: filters.state });
    if (filters.verified) activeFilters.push({ type: 'verified', value: true, label: 'Verified' });
    if (filters.featured) activeFilters.push({ type: 'featured', value: true, label: 'Featured' });
    if (filters.military_owned) activeFilters.push({ type: 'military_owned', value: true, label: 'Military Owned' });
    if (filters.min_rating) activeFilters.push({ type: 'min_rating', value: filters.min_rating, label: `${filters.min_rating}+ stars` });

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-sm text-gray-600 mr-2">Active filters:</span>
        {activeFilters.map((filter, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
          >
            {filter.label}
            <button
              onClick={() => {
                if (filter.type === 'search') setSearchQuery('');
                else if (filter.type === 'location') setSearchLocation('');
                else handleFilterChange({ [filter.type]: filter.type === 'category_ids' ? [] : false });
              }}
              className="hover:bg-primary-200 rounded-full p-0.5"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          onClick={() => {
            clearSearch();
            clearFilters();
          }}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Clear all
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Header */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container-custom py-4">
          <div className="max-w-2xl mx-auto mb-4">
            <SearchBar 
              showLocation={true}
              placeholder="Search for services or businesses..."
              initialQuery={searchQuery}
              initialLocation={searchLocation}
              onSearch={handleSearch}
            />
          </div>

          {/* Search Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                <>
                  <span>
                    {pagination.totalCount.toLocaleString()} results
                    {searchMeta.searchTime > 0 && ` in ${searchMeta.searchTime.toFixed(2)}s`}
                  </span>
                  {searchQuery && (
                    <span className="text-gray-400">
                      for "{searchQuery}"
                      {searchLocation && ` in ${searchLocation}`}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
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

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden btn-secondary flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-6">
        <div className="flex gap-8">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden sm:block w-80 flex-shrink-0">
            <div className="sticky top-40">
              <BusinessFilters
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="block w-full text-left text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 px-2 py-1 rounded"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Results */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="sm:hidden mb-6 border border-gray-200 rounded-lg bg-white p-4"
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

            {/* Active Filters */}
            <ActiveFilters />

            {/* Search Suggestions */}
            {searchMeta.suggestions.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Related searches:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {searchMeta.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="text-sm text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <LoadingSkeleton type="business-grid" />
            ) : businesses.length > 0 ? (
              <div className="space-y-8">
                {/* Business Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {businesses.map((business, index) => (
                    <motion.div
                      key={business.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <BusinessCard 
                        business={business} 
                        showDistance={!!searchLocation}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
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
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  No businesses found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any businesses matching your search criteria.
                  Try adjusting your filters or search terms.
                </p>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        clearSearch();
                        clearFilters();
                      }}
                      className="btn-primary"
                    >
                      Clear all filters
                    </button>
                    <button
                      onClick={() => handleSearch('', '')}
                      className="btn-secondary"
                    >
                      Browse all businesses
                    </button>
                  </div>

                  {/* Search Tips */}
                  <div className="mt-8 text-left max-w-md mx-auto">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Search tips:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Try more general terms (e.g., "plumbing" instead of "emergency plumber")</li>
                      <li>• Check your spelling</li>
                      <li>• Remove location filters to search nationwide</li>
                      <li>• Browse by category instead</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}