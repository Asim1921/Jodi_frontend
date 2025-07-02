// src/components/business/business-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Business } from '@/lib/api';
import { formatDistance, formatPhoneNumber, truncateText } from '@/lib/utils';

interface BusinessCardProps {
  business: Business;
  featured?: boolean;
  showDistance?: boolean;
  className?: string;
}

export function BusinessCard({ 
  business, 
  featured = false, 
  showDistance = false, 
  className = '' 
}: BusinessCardProps) {
  // Helper functions to safely handle data
  const getAverageRating = () => {
    const rating = parseFloat(String(business.average_rating || 0));
    return isNaN(rating) ? 0 : rating;
  };

  const getTotalReviews = () => {
    const reviews = parseInt(String(business.total_reviews || 0));
    return isNaN(reviews) ? 0 : reviews;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-4 w-4 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIconSolid className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  const averageRating = getAverageRating();
  const totalReviews = getTotalReviews();

  return (
    <div className={`business-card group ${className}`}>
      {/* Image Section */}
      <div className="relative">
        <div className="business-card-image bg-gray-200 relative overflow-hidden">
          {/* Placeholder image - replace with actual business images when available */}
          <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-military-100 flex items-center justify-center">
            <BuildingOfficeIcon className="h-12 w-12 text-primary-400" />
          </div>
          
          {/* Image overlay with business status badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {featured && (
              <span className="featured-badge">
                Featured
              </span>
            )}
            {business.verified && (
              <span className="verified-badge">
                <CheckBadgeIcon className="h-3 w-3 mr-1" />
                Verified
              </span>
            )}
            {business.military_owned && (
              <span className="veteran-badge">
                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                Veteran Owned
              </span>
            )}
          </div>

          {/* Distance badge */}
          {showDistance && business.distance && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                <MapPinIcon className="h-3 w-3 mr-1" />
                {formatDistance(business.distance)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="business-card-content">
        {/* Header */}
        <div className="mb-3">
          <Link 
            href={`/businesses/${business.slug || business.id}`}
            className="business-card-title hover:text-primary-600 transition-colors duration-200"
          >
            {business.business_name || 'Business Name'}
          </Link>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-1 mt-1">
            {(business.categories || []).slice(0, 2).map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center text-xs text-gray-500"
              >
                <i className={`${category.icon_class || ''} mr-1`}></i>
                {category.name}
              </span>
            ))}
            {(business.categories || []).length > 2 && (
              <span className="text-xs text-gray-500">
                +{business.categories.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="business-card-description">
          {truncateText(business.description || '', 120)}
        </p>

        {/* Rating and Reviews */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {renderStars(averageRating)}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Location and Contact */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{business.city || 'City'}, {business.state || 'State'}</span>
          </div>
          
          {business.business_phone && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
              <a 
                href={`tel:${business.business_phone}`}
                className="hover:text-primary-600 transition-colors duration-200"
              >
                {formatPhoneNumber(business.business_phone)}
              </a>
            </div>
          )}
          
          {business.website_url && (
            <div className="flex items-center text-sm text-gray-600">
              <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
              <a 
                href={business.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 transition-colors duration-200 truncate"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        {/* Service Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {business.emergency_service && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Emergency Service
            </span>
          )}
          {business.insured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Insured
            </span>
          )}
        </div>

        {/* Owner Info */}
        <div className="business-card-meta">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs font-medium text-gray-600">
                {(business.owner?.name || 'Owner').charAt(0)}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {business.owner?.name || 'Business Owner'}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-xs text-gray-500 capitalize">
              {business.owner?.membership_status || 'Member'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Link
            href={`/businesses/${business.slug || business.id}`}
            className="flex-1 btn-primary text-center"
          >
            View Details
          </Link>
          <Link
            href={`/businesses/${business.slug || business.id}/contact`}
            className="flex-1 btn-secondary text-center"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}