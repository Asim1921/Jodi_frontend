// src/components/business/business-filters.tsx
'use client';

import { useState } from 'react';
import { 
  XMarkIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  StarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { BusinessCategory } from '@/lib/api';

interface BusinessFiltersProps {
  categories: BusinessCategory[];
  filters: {
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
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  compact?: boolean;
}

export function BusinessFilters({
  categories,
  filters,
  onFilterChange,
  onClearFilters,
  compact = false
}: BusinessFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    location: true,
    features: true,
    rating: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    if (compact) return; // Don't allow collapsing in compact mode
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategoryIds = filters.category_ids.includes(categoryId)
      ? filters.category_ids.filter(id => id !== categoryId)
      : [...filters.category_ids, categoryId];
    
    onFilterChange({ category_ids: newCategoryIds });
  };

  const handleFeatureToggle = (feature: string) => {
    onFilterChange({ [feature]: !filters[feature as keyof typeof filters] });
  };

  const popularCategories = categories
    .sort((a, b) => b.businesses_count - a.businesses_count)
    .slice(0, compact ? 6 : 10);

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category_ids.length > 0) count++;
    if (filters.state) count++;
    if (filters.city) count++;
    if (filters.verified) count++;
    if (filters.featured) count++;
    if (filters.military_owned) count++;
    if (filters.emergency_service) count++;
    if (filters.insured) count++;
    if (filters.min_rating) count++;
    return count;
  };

  const FilterSection = ({ 
    title, 
    section, 
    children 
  }: { 
    title: string; 
    section: keyof typeof expandedSections; 
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-4 text-left"
        disabled={compact}
      >
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {!compact && (
          <span className="text-gray-400">
            {expandedSections[section] ? '−' : '+'}
          </span>
        )}
      </button>
      {(expandedSections[section] || compact) && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {getActiveFilterCount() > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear all ({getActiveFilterCount()})
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Categories */}
        <FilterSection title="Categories" section="categories">
          <div className="space-y-2">
            {popularCategories.map((category) => (
              <label
                key={category.id}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.category_ids.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="form-checkbox text-primary-600"
                />
                <div className="ml-3 flex items-center flex-1 min-w-0">
                  <i className={`${category.icon_class} text-gray-400 mr-2 flex-shrink-0`}></i>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">
                    {category.name}
                  </span>
                  <span className="ml-auto text-xs text-gray-500 flex-shrink-0">
                    {category.businesses_count}
                  </span>
                </div>
              </label>
            ))}
            {!compact && categories.length > 10 && (
              <button className="text-sm text-primary-600 hover:text-primary-700">
                Show all categories
              </button>
            )}
          </div>
        </FilterSection>

        {/* Location */}
        <FilterSection title="Location" section="location">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => onFilterChange({ state: e.target.value })}
                className="form-select w-full text-sm"
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => onFilterChange({ city: e.target.value })}
                placeholder="Enter city name"
                className="form-input w-full text-sm"
              />
            </div>
          </div>
        </FilterSection>

        {/* Business Features */}
        <FilterSection title="Business Features" section="features">
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.military_owned}
                onChange={() => handleFeatureToggle('military_owned')}
                className="form-checkbox text-primary-600"
              />
              <div className="ml-3 flex items-center">
                <ShieldCheckIcon className="h-4 w-4 text-primary-600 mr-2" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Military Owned
                </span>
              </div>
            </label>

            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={() => handleFeatureToggle('verified')}
                className="form-checkbox text-primary-600"
              />
              <div className="ml-3 flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Verified
                </span>
              </div>
            </label>

            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={() => handleFeatureToggle('featured')}
                className="form-checkbox text-primary-600"
              />
              <div className="ml-3 flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Featured
                </span>
              </div>
            </label>

            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.emergency_service}
                onChange={() => handleFeatureToggle('emergency_service')}
                className="form-checkbox text-primary-600"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                Emergency Service
              </span>
            </label>

            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.insured}
                onChange={() => handleFeatureToggle('insured')}
                className="form-checkbox text-primary-600"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                Insured
              </span>
            </label>
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Minimum Rating" section="rating">
          <div className="space-y-2">
            {[4.5, 4.0, 3.5, 3.0].map((rating) => (
              <label
                key={rating}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="min_rating"
                  checked={filters.min_rating === rating}
                  onChange={() => onFilterChange({ min_rating: rating })}
                  className="form-radio text-primary-600"
                />
                <div className="ml-3 flex items-center">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {rating}+ stars
                  </span>
                </div>
              </label>
            ))}
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="min_rating"
                checked={!filters.min_rating}
                onChange={() => onFilterChange({ min_rating: undefined })}
                className="form-radio text-primary-600"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                Any rating
              </span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}