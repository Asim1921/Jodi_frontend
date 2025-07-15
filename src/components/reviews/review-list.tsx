// src/components/reviews/review-list.tsx - Fixed TypeScript errors
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon,
  FunnelIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ReviewListProps {
  businessId: number;
  businessName: string;
  canReview?: boolean | null ;
}

interface Review {
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

interface ReviewStatistics {
  total_reviews: number;
  average_rating: number;
  rating_distribution: Record<string, number>;
  verified_reviews: number;
  recommend_percentage: number;
  recent_reviews: Review[];
}

interface ApiFilters {
  rating?: string;
  verified?: boolean;
  sortBy: string;
}

export function ReviewList({ businessId, businessName, canReview = true }: ReviewListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [filters, setFilters] = useState<ApiFilters>({
    rating: '',
    verified: false,
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [businessId, filters, currentPage]);

  const fetchReviews = async () => {
    try {
      // Convert string rating to number for API
      const params: {
        page: number;
        per_page: number;
        rating?: number;
        verified?: boolean;
        sort_by: string;
      } = {
        page: currentPage,
        per_page: 10,
        sort_by: filters.sortBy
      };

      // Only add rating if it's not empty string
      if (filters.rating && filters.rating !== '') {
        params.rating = parseInt(filters.rating);
      }

      // Only add verified if it's true
      if (filters.verified) {
        params.verified = filters.verified;
      }

      const response = await api.reviews.list(businessId, params);

      console.log("Review Response", response)
      const { reviews: newReviews, statistics: stats, meta } = response.data.data;

      if (currentPage === 1) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }

      setStatistics(stats);
      setHasMore(meta ? meta.current_page < meta.total_pages : false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = (review: Review) => {
    if (editingReview) {
      // Update existing review in list
      setReviews(prev => prev.map(r => r.id === review.id ? review : r));
      setEditingReview(null);
    } else {
      // Add new review to top of list
      setReviews(prev => [review, ...prev]);
    }
    setShowReviewForm(false);
    
    // Refresh statistics
    fetchReviews();
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.reviews.delete(businessId, reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Review deleted successfully');
      
      // Refresh statistics
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleHelpfulVote = async (reviewId: number) => {
    try {
      const response = await api.reviews.helpful(businessId, reviewId);
      
      // Update the helpful count in the local state
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, helpful_count: response.data.data.helpful_count }
          : r
      ));
      
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error voting helpful:', error);
      toast.error('Failed to record your vote');
    }
  };

  const handleFilterChange = (key: keyof ApiFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const loadMoreReviews = () => {
    setCurrentPage(prev => prev + 1);
  };

  const renderStars = (rating: number, size = 'h-4 w-4') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIconSolid key={i} className={`${size} text-yellow-400`} />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className={`${size} text-yellow-400`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIconSolid className={`${size} text-yellow-400`} />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className={`${size} text-gray-300`} />);
    }

    return <div className="flex items-center">{stars}</div>;
  };

  const renderRatingDistribution = () => {
    if (!statistics) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = statistics.rating_distribution[rating.toString()] || 0;
          const percentage = statistics.total_reviews > 0 
            ? (count / statistics.total_reviews) * 100 
            : 0;

          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-8">{rating}</span>
              <StarIconSolid className="h-3 w-3 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const userReview = reviews.find(r => r?.user?.id === user?.id);

  if (loading && currentPage === 1) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="skeleton-avatar"></div>
              <div className="flex-1">
                <div className="skeleton-text w-1/3"></div>
                <div className="skeleton-text w-1/4"></div>
              </div>
            </div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {statistics && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
               {typeof statistics?.average_rating === 'number'
  ? statistics.average_rating.toFixed(1)
  : '0.0'}

              </div>
              {renderStars(statistics.average_rating, 'h-6 w-6')}
              <p className="text-sm text-gray-600 mt-2">
                Based on {statistics.total_reviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rating Breakdown</h4>
              {renderRatingDistribution()}
            </div>

            {/* Additional Stats */}
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.recommend_percentage}%
                </div>
                <p className="text-sm text-green-800">Recommend this business</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.verified_reviews}
                </div>
                <p className="text-sm text-blue-800">Verified reviews</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Section */}
      {canReview  && user && !userReview && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Share Your Experience</h3>
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-primary"
            >
              <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
              Write Review
            </button>
          </div>
          <p className="text-gray-600">
            Help others by sharing your experience with {businessName}.
          </p>
        </div>
      )}

      {/* User's Existing Review */}
      {userReview && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Your Review</h4>
            <button
              onClick={() => handleEditReview(userReview)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            {renderStars(userReview.rating)}
            <span className="text-sm text-blue-800">{userReview.review_title || 'No title'}</span>
          </div>
          <p className="text-sm text-blue-700">{userReview.review_text || 'No review text'}</p>
        </div>
      )}

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm
            businessId={businessId}
            businessName={businessName}
            existingReview={editingReview}
            onSuccess={handleReviewSubmit}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
            isModal
          />
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Customer Reviews</h3>
          
          <div className="flex items-center space-x-4">
            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>

            {/* Verified Filter */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => handleFilterChange('verified', e.target.checked)}
                className="form-checkbox text-sm"
              />
              <span className="ml-2 text-sm text-gray-700">Verified only</span>
            </label>

            {/* Sort Filter */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="form-select text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
              <option value="helpful">Most helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">
              Be the first to share your experience with this business.
            </p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                onHelpful={handleHelpfulVote}
              />         
            )

            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMoreReviews}
                  className="btn-secondary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-2" />
                      Load More Reviews
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}