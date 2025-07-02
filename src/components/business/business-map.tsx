// src/components/business/business-map.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Business } from '@/lib/api';

interface BusinessMapProps {
  businesses: Business[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
}

export function BusinessMap({ 
  businesses, 
  center, 
  zoom = 10, 
  height = '100%',
  className = ''
}: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          initializeMap();
          return;
        }

        // Check if API key is available
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          setError('Google Maps API key not configured');
          return;
        }

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          initializeMap();
        };
        
        script.onerror = () => {
          setError('Failed to load Google Maps');
        };

        document.head.appendChild(script);
      } catch (err) {
        setError('Error loading map');
        console.error('Map loading error:', err);
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        // Calculate center if not provided
        let mapCenter = center;
        if (!mapCenter && businesses.length > 0) {
          const businessesWithCoords = businesses.filter(b => b.latitude && b.longitude);
          if (businessesWithCoords.length > 0) {
            const avgLat = businessesWithCoords.reduce((sum, b) => sum + (b.latitude || 0), 0) / businessesWithCoords.length;
            const avgLng = businessesWithCoords.reduce((sum, b) => sum + (b.longitude || 0), 0) / businessesWithCoords.length;
            mapCenter = { lat: avgLat, lng: avgLng };
          } else {
            mapCenter = { lat: 39.8283, lng: -98.5795 }; // Center of US
          }
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center: mapCenter || { lat: 39.8283, lng: -98.5795 },
          zoom: businesses.length === 1 ? 15 : zoom,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add markers for businesses
        const bounds = new window.google.maps.LatLngBounds();
        let hasValidCoordinates = false;

        businesses.forEach((business) => {
          if (business.latitude && business.longitude) {
            hasValidCoordinates = true;
            const position = { lat: business.latitude, lng: business.longitude };
            
            // Create custom marker
            const marker = new window.google.maps.Marker({
              position,
              map,
              title: business.business_name,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: business.military_owned ? '#1f2937' : '#3b82f6',
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }
            });

            // Create info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div class="p-3 max-w-xs">
                  <h3 class="font-semibold text-gray-900 mb-1">${business.business_name}</h3>
                  <p class="text-sm text-gray-600 mb-2">${business.description?.substring(0, 100)}${business.description && business.description.length > 100 ? '...' : ''}</p>
                  <div class="flex items-center mb-2">
                    <div class="flex items-center">
                      ${[...Array(5)].map((_, i) => 
                        `<svg class="h-3 w-3 ${i < Math.floor(business.average_rating) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>`
                      ).join('')}
                    </div>
                    <span class="ml-1 text-xs text-gray-600">${business.average_rating.toFixed(1)} (${business.total_reviews})</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <a href="/businesses/${business.slug}" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View Details
                    </a>
                    <span class="text-gray-300">•</span>
                    <a href="tel:${business.business_phone}" class="text-green-600 hover:text-green-700 text-sm font-medium">
                      Call
                    </a>
                  </div>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            bounds.extend(position);
          }
        });

        // Fit map to show all markers
        if (hasValidCoordinates && businesses.length > 1) {
          map.fitBounds(bounds);
          
          // Ensure minimum zoom level
          const listener = window.google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom() && map.getZoom()! > 15) {
              map.setZoom(15);
            }
            window.google.maps.event.removeListener(listener);
          });
        }

        setMapLoaded(true);
      } catch (err) {
        setError('Error initializing map');
        console.error('Map initialization error:', err);
      }
    };

    loadGoogleMaps();
  }, [businesses, center, zoom]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Not Available</h3>
          <p className="text-gray-600 text-sm">{error}</p>
          {error === 'Google Maps API key not configured' && (
            <p className="text-gray-500 text-xs mt-2">
              Contact administrator to configure Google Maps
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Global type for Google Maps
declare global {
  interface Window {
    google: any;
  }
}