// src/app/businesses/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  PhoneIcon as PhoneIconSolid
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { api, Business } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BusinessCard } from '@/components/business/business-card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { BusinessMap } from '@/components/business/business-map';
import { ContactModal } from '@/components/business/contact-modal';
import { ReviewModal } from '@/components/business//review-modal';
import { formatPhoneNumber, formatDate, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  review_text: string;
  review_title: string;
  created_at: string;
  verified_purchase: boolean;
  response_from_owner?: string;
  owner_response_date?: string;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedBusinesses, setRelatedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.slug) {
      fetchBusinessDetails();
    }
  }, [params.slug]);

  const fetchBusinessDetails = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockBusiness: Business = {
        id: 1,
        business_name: "Smith Plumbing Services",
        slug: "smith-plumbing",
        description: "Professional plumbing services with over 15 years of experience. We specialize in residential and commercial plumbing installations, repairs, and emergency services. Our team of licensed plumbers is available 24/7 for emergency calls. We pride ourselves on honest pricing, quality workmanship, and excellent customer service.",
        business_phone: "15551001",
        business_email: "info@smithplumbing.com",
        website_url: "https://smithplumbing.com",
        full_address: "123 Main Street, Austin, TX 73301",
        city: "Austin",
        state: "TX",
        average_rating: 4.8,
        total_reviews: 45,
        featured: true,
        verified: true,
        military_owned: true,
        business_status: "approved",
        emergency_service: true,
        insured: true,
        owner: { name: "John Smith", membership_status: "veteran" },
        categories: [
          { id: 1, name: "Plumbing", icon_class: "fas fa-wrench" },
          { id: 2, name: "Emergency Plumbing", icon_class: "fas fa-water" }
        ],
        created_at: "2024-01-15T10:00:00Z"
      };

      setBusiness(mockBusiness);

      // Mock reviews
      setReviews([
        {
          id: 1,
          user_name: "Jennifer Wilson",
          rating: 5,
          review_title: "Excellent Service!",
          review_text: "John was professional, punctual, and fixed our plumbing issue quickly. His pricing was fair and he explained everything clearly. Highly recommend!",
          created_at: "2024-01-18T16:45:00Z",
          verified_purchase: true,
          response_from_owner: "Thank you Jennifer! It was a pleasure working with you. We're always here if you need any future plumbing services.",
          owner_response_date: "2024-01-19T09:30:00Z"
        },
        {
          id: 2,
          user_name: "Robert Brown",
          rating: 5,
          review_title: "Great Work and Fair Pricing",
          review_text: "Smith Plumbing handled our kitchen renovation plumbing perfectly. They were clean, efficient, and the work passed inspection on the first try.",
          created_at: "2024-01-17T11:20:00Z",
          verified_purchase: true
        },
        {
          id: 3,
          user_name: "Sarah Davis",
          rating: 4,
          review_title: "Reliable Emergency Service",
          review_text: "Called them for a weekend emergency and they came out within an hour. Problem was fixed quickly. Only minor complaint is the service fee was a bit high.",
          created_at: "2024-01-15T14:30:00Z",
          verified_purchase: false
        }
      ]);

      // Mock related businesses
      setRelatedBusinesses([
        {
          id: 2,
          business_name: "Johnson HVAC Solutions",
          slug: "johnson-hvac",
          description: "Professional HVAC services...",
          business_phone: "15551002",
          business_email: "info@johnsonhvac.com",
          website_url: "https://johnsonhvac.com",
          full_address: "456 Oak Ave, Austin, TX 73302",
          city: "Austin",
          state: "TX",
          average_rating: 4.6,
          total_reviews: 32,
          featured: false,
          verified: true,
          military_owned: true,
          business_status: "approved",
          emergency_service: true,
          insured: true,
          owner: { name: "Mike Johnson", membership_status: "veteran" },
          categories: [{ id: 3, name: "HVAC", icon_class: "fas fa-fan" }],
          created_at: "2024-01-10T10:00:00Z"
        }
      ]);

    } catch (error) {
      console.error('Error fetching business details:', error);
      toast.error('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorited(!isFavorited);
      toast.error('Failed to update favorites');
    }
  };

  const handleShare = async () => {
    if (navigator.share && business) {
      try {
        await navigator.share({
          title: business.business_name,
          text: business.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className={`${sizeClasses[size]} text-yellow-400`} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIconSolid className={`${sizeClasses[size]} text-yellow-400`} />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-300`} />
      );
    }

    return stars;
  };

  const businessHours = {
    monday: { open: '8:00 AM', close: '6:00 PM' },
    tuesday: { open: '8:00 AM', close: '6:00 PM' },
    wednesday: { open: '8:00 AM', close: '6:00 PM' },
    thursday: { open: '8:00 AM', close: '6:00 PM' },
    friday: { open: '8:00 AM', close: '6:00 PM' },
    saturday: { open: '9:00 AM', close: '4:00 PM' },
    sunday: { closed: true }
  };

  const mockImages = [
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400'
  ];

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

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-16 text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600 mb-6">The business you're looking for doesn't exist or has been removed.</p>
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

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-gray-700">Home</Link></li>
              <li><span>/</span></li>
              <li><Link href="/businesses" className="hover:text-gray-700">Businesses</Link></li>
              <li><span>/</span></li>
              <li className="text-gray-900">{business.business_name}</li>
            </ol>
          </nav>

          <div className="lg:flex lg:gap-8">
            {/* Main Info */}
            <div className="lg:flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
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

                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {business.business_name}
                  </h1>

                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      {renderStars(business.average_rating, 'lg')}
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                      {business.average_rating.toFixed(1)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      ({business.total_reviews} reviews)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {business.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.id}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        <i className={`${category.icon_class} mr-2`}></i>
                        {category.name}
                      </Link>
                    ))}
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{business.full_address}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 sm:mt-0 sm:ml-6">
                  <button
                    onClick={handleFavoriteToggle}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorited ? (
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    title="Share business"
                  >
                    <ShareIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <a
                  href={`tel:${business.business_phone}`}
                  className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                >
                  <PhoneIconSolid className="h-5 w-5" />
                  Call Now
                </a>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  Send Message
                </button>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  <StarIcon className="h-5 w-5" />
                  Write Review
                </button>
              </div>
            </div>

            {/* Contact Card */}
            <div className="lg:w-80 lg:flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <a
                      href={`tel:${business.business_phone}`}
                      className="text-gray-900 hover:text-primary-600"
                    >
                      {formatPhoneNumber(business.business_phone)}
                    </a>
                  </div>

                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <a
                      href={`mailto:${business.business_email}`}
                      className="text-gray-900 hover:text-primary-600"
                    >
                      {business.business_email}
                    </a>
                  </div>

                  {business.website_url && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <a
                        href={business.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-primary-600"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <span className="text-gray-900">{business.full_address}</span>
                  </div>
                </div>

                {/* Business Hours - Simple Version */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Business Hours
                  </h4>
                  <div className="space-y-1 text-sm">
                    {[
                      { day: 'Monday', hours: '8:00 AM - 6:00 PM' },
                      { day: 'Tuesday', hours: '8:00 AM - 6:00 PM' },
                      { day: 'Wednesday', hours: '8:00 AM - 6:00 PM' },
                      { day: 'Thursday', hours: '8:00 AM - 6:00 PM' },
                      { day: 'Friday', hours: '8:00 AM - 6:00 PM' },
                      { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
                      { day: 'Sunday', hours: 'Closed' }
                    ].map(({ day, hours }) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-600">{day}</span>
                        <span className="text-gray-900">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Features */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Service Features</h4>
                  <div className="space-y-2">
                    {business.emergency_service && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckBadgeIcon className="h-4 w-4 text-red-500 mr-2" />
                        Emergency Service Available
                      </div>
                    )}
                    {business.insured && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckBadgeIcon className="h-4 w-4 text-green-500 mr-2" />
                        Fully Insured
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckBadgeIcon className="h-4 w-4 text-blue-500 mr-2" />
                      Licensed Professional
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="lg:flex lg:gap-8">
          {/* Content Area */}
          <div className="lg:flex-1">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-8">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'reviews', name: `Reviews (${business.total_reviews})` },
                { id: 'photos', name: 'Photos' },
                { id: 'location', name: 'Location' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {business.business_name}</h2>
                  <p className="text-gray-700 leading-relaxed">{business.description}</p>
                </div>

                {/* Owner Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Owner</h2>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      <span className="text-lg font-medium text-gray-600">
                        {business.owner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{business.owner.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {business.owner.membership_status} • Business Owner
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Reviews Preview */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View all reviews
                    </button>
                  </div>
                  <div className="space-y-4">
                    {reviews.slice(0, 2).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center mr-3">
                            {renderStars(review.rating)}
                          </div>
                          <span className="font-medium text-gray-900">{review.user_name}</span>
                          <span className="text-gray-400 mx-2">•</span>
                          <span className="text-sm text-gray-600">{timeAgo(review.created_at)}</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{review.review_title}</h4>
                        <p className="text-gray-700 text-sm">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="btn-primary"
                    >
                      Write a Review
                    </button>
                  </div>

                  <div className="flex items-center mb-6">
                    <div className="flex items-center mr-6">
                      <span className="text-4xl font-bold text-gray-900 mr-2">
                        {business.average_rating.toFixed(1)}
                      </span>
                      <div>
                        <div className="flex items-center mb-1">
                          {renderStars(business.average_rating, 'lg')}
                        </div>
                        <p className="text-sm text-gray-600">{business.total_reviews} reviews</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {review.user_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center mb-1">
                              <span className="font-medium text-gray-900 mr-2">{review.user_name}</span>
                              {review.verified_purchase && (
                                <CheckBadgeIcon className="h-4 w-4 text-green-500" title="Verified customer" />
                              )}
                            </div>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                              <span className="text-gray-400 mx-2">•</span>
                              <span className="text-sm text-gray-600">{formatDate(review.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <FlagIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <h4 className="font-medium text-gray-900 mb-2">{review.review_title}</h4>
                      <p className="text-gray-700 mb-4">{review.review_text}</p>

                      {review.response_from_owner && (
                        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-gray-900">Response from {business.owner.name}</span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="text-sm text-gray-600">
                              {formatDate(review.owner_response_date!)}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.response_from_owner}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Photos</h2>

                  {/* Main Image */}
                  <div className="mb-4">
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-4 gap-2">
                    {mockImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 ${selectedImageIndex === index ? 'border-primary-500' : 'border-transparent'
                          }`}
                      >
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Location & Service Area</h2>
                  <div className="h-96 rounded-lg overflow-hidden">
                    <BusinessMap businesses={[business]} center={{ lat: 30.2672, lng: -97.7431 }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 mt-8 lg:mt-0">
            {/* Related Businesses */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Businesses</h3>
              <div className="space-y-4">
                {relatedBusinesses.map((relatedBusiness) => (
                  <div key={relatedBusiness.id} className="border border-gray-200 rounded-lg p-4">
                    <BusinessCard business={relatedBusiness} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showContactModal && (
        <ContactModal
          business={business}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          business={business}
          onClose={() => setShowReviewModal(false)}
          onSubmit={(reviewData) => {
            console.log('Review submitted:', reviewData);
            setShowReviewModal(false);
            toast.success('Review submitted successfully!');
          }}
        />
      )}

      <Footer />
    </div>
  );
}