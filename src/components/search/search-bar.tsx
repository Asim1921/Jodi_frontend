// src/components/search/search-bar.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface SearchBarProps {
  placeholder?: string;
  showLocation?: boolean;
  initialQuery?: string;
  initialLocation?: string;
  onSearch?: (query: string, location?: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Search for services...",
  showLocation = false,
  initialQuery = "",
  initialLocation = "",
  onSearch,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(query, showLocation ? location : undefined);
    } else {
      // Navigate to search page with parameters
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (showLocation && location.trim()) params.set('location', location.trim());
      
      router.push(`/search?${params.toString()}`);
    }
  };

  const clearQuery = () => {
    setQuery('');
  };

  const clearLocation = () => {
    setLocation('');
  };

  const getCurrentLocation = () => {
    setIsLocationEnabled(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get city/state
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}&limit=1`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              const city = result.components.city || result.components.town || result.components.village;
              const state = result.components.state;
              
              if (city && state) {
                setLocation(`${city}, ${state}`);
              }
            }
          } catch (error) {
            console.error('Error getting location name:', error);
          }
          
          setIsLocationEnabled(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocationEnabled(false);
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className={`flex ${showLocation ? 'flex-col sm:flex-row' : ''} gap-2`}>
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="search-input pl-10"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Location Input */}
        {showLocation && (
          <div className="relative sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or ZIP"
              className="search-input pl-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              {location && (
                <button
                  type="button"
                  onClick={clearLocation}
                  className="p-1 mr-1"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLocationEnabled}
                className="pr-3 text-primary-600 hover:text-primary-700 disabled:opacity-50"
                title="Use current location"
              >
                {isLocationEnabled ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"
                  />
                ) : (
                  <span className="text-xs font-medium">GPS</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="btn-primary px-6 whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          'Plumbing',
          'HVAC',
          'Legal Services',
          'Electrical',
          'Security',
          'Event Planning'
        ].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setQuery(suggestion)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </form>
  );
}