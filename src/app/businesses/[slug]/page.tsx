// src/app/(main)/businesses/[slug]/page.tsx - Updated with Reviews Integration
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { api, Business } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ReviewList } from '@/components/reviews/review-list';
import { formatPhoneNumber, timeAgo } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import toast from 'react-hot-toast';

export default function BusinessDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await api.businesses.get(slug);
        setBusiness(response.data.data.business);
      } catch (error: any) {
        console.error('Error fetching business:', error);
        setError('Business not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBusiness();
    }
  }, [slug]);

  const renderStars = (rating: number) => {
    const safeRating = Number(rating) || 0;
    const stars = [];
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIconSolid className="h-5 w-5 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(safeRating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      );
    }

    return stars;
  };

  const handleContact = (method: string) => {
    // Track contact method
    toast.success(`Opening ${method}...`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business?.business_name,
        text: business?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Determine if user can review this business
  const canReview = user && business && user.id !== business.owner_details.id;
  console.log("can review",{canReview, user, business} );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-16">
          <div className="animate-pulse">
            <div className="skeleton h-8 w-1/3 mb-4"></div>
            <div className="skeleton h-64 w-full mb-6"></div>
            <div className="skeleton h-4 w-2/3 mb-2"></div>
            <div className="skeleton h-4 w-1/2 mb-2"></div>
            <div className="skeleton h-4 w-3/4"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-16 text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600 mb-8">
            The business you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/businesses" className="btn-primary">
            Browse All Businesses
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <nav className="flex text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/businesses" className="text-gray-500 hover:text-gray-700">Businesses</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{business.business_name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Business Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6 mb-6"
            >
              {/* Business Image */}
              <div className="relative h-64 bg-gradient-to-br from-primary-100 to-military-100 rounded-lg mb-6 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BuildingOfficeIcon className="h-16 w-16 text-primary-400" />
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {business.featured && (
                    <span className="featured-badge">Featured</span>
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

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                  >
                    <ShareIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                    <HeartIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Business Info */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {business.business_name}
                </h1>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {business.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.id}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                    >
                      <i className={`${category.icon_class} mr-1 text-xs`}></i>
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {renderStars(Number(business.average_rating) || 0)}
                  </div>
                  <span className="ml-2 text-lg font-semibold text-gray-900">
                    {(Number(business.average_rating) || 0).toFixed(1)}
                  </span>
                  <span className="ml-2 text-gray-600">
                    ({business.total_reviews || 0} reviews)
                  </span>
                </div>

                {/* Service Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {business.emergency_service && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Emergency Service
                    </span>
                  )}
                  {business.insured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Insured
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed">
                  {business.description}
                </p>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', name: 'Overview' },
                    { id: 'reviews', name: `Reviews (${business.total_reviews || 0})` },
                    { id: 'contact', name: 'Contact' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Business Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Years in Business</span>
                          <p className="text-gray-900">{business.years_in_business || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Employees</span>
                          <p className="text-gray-900">{business.employee_count || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">License</span>
                          <p className="text-gray-900">{business.license_number || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Service Areas</span>
                          <p className="text-gray-900">{business.areas_served || 'Local area'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Owner</h3>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{business.owner.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{business.owner.membership_status}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <ReviewList
                    businessId={business.id}
                    businessName={business.business_name}
                    canReview={canReview}
                  />
                )}

                {activeTab === 'contact' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span>{business.full_address}</span>
                      </div>
                      {business.business_phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <a
                            href={`tel:${business.business_phone}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {formatPhoneNumber(business.business_phone)}
                          </a>
                        </div>
                      )}
                      {business.business_email && (
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <a
                            href={`mailto:${business.business_email}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {business.business_email}
                          </a>
                        </div>
                      )}
                      {business.website_url && (
                        <div className="flex items-center">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <a
                            href={business.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6 mb-6 sticky top-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{business.city}, {business.state}</span>
                </div>
                
                {business.business_phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <span>{formatPhoneNumber(business.business_phone)}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>Member since {timeAgo(business.created_at)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {business.business_phone && (
                  <button
                    onClick={() => handleContact('phone')}
                    className="w-full btn-primary"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Call Now
                  </button>
                )}
                
                <button
                  onClick={() => handleContact('message')}
                  className="w-full btn-secondary"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                  Send Message
                </button>
                
                {business.website_url && (
                  <a
                    href={business.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-secondary text-center block"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2 inline" />
                    Visit Website
                  </a>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                  <FlagIcon className="h-4 w-4 mr-1" />
                  Report this business
                </button>
              </div>
            </motion.div>

            {/* Similar Businesses */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Businesses</h3>
              <p className="text-gray-600 text-sm">
                Discover more veteran-owned businesses in your area.
              </p>
              <Link
                href={`/businesses?category=${business.categories[0]?.id}&state=${business.state}`}
                className="btn-secondary mt-4 w-full text-center block"
              >
                Browse Similar
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}