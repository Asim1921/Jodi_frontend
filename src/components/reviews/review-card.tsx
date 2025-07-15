// src/components/reviews/review-card.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon,
  HandThumbUpIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '@/hooks/use-auth';
import { formatDate, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ReviewCardProps {
  review: {
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
  };
  onEdit: (review: any) => void;
  onDelete: (reviewId: number) => void;
  onHelpful: (reviewId: number) => void;
}

export function ReviewCard({ review, onEdit, onDelete, onHelpful }: ReviewCardProps) {
  const { user } = useAuth();
  const [showFullText, setShowFullText] = useState(false);
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isOwnReview = user?.id === review.user.id;
  const shouldTruncate = review.review_text.length > 300;
  const displayText = shouldTruncate && !showFullText 
    ? review.review_text.substring(0, 300) + '...'
    : review.review_text;

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

  const handleHelpfulVote = () => {
    if (hasVotedHelpful) {
      toast.error('You have already found this review helpful');
      return;
    }

    if (isOwnReview) {
      toast.error('You cannot vote on your own review');
      return;
    }

    onHelpful(review.id);
    setHasVotedHelpful(true);
  };

  const handleReport = () => {
    // In a real app, this would open a report modal
    setShowReportModal(true);
    toast.success('Review reported. Thank you for your feedback.');
  };

  const getCostRangeDisplay = (range: string) => {
    const ranges: Record<string, string> = {
      'under_100': 'Under $100',
      '100_500': '$100 - $500',
      '500_1000': '$500 - $1,000',
      '1000_5000': '$1,000 - $5,000',
      '5000_10000': '$5,000 - $10,000',
      'over_10000': 'Over $10,000'
    };
    return ranges[range] || range;
  };

  const getMembershipBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      veteran: 'bg-military-100 text-military-800',
      spouse: 'bg-purple-100 text-purple-800',
      member: 'bg-blue-100 text-blue-800',
      supporter: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.supporter;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="h-6 w-6 text-gray-500" />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900">{review.user.name}</h4>
              
              {/* Membership Badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getMembershipBadgeColor(review.user.membership_status)}`}>
                {review.user.membership_status === 'veteran' && (
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                )}
                {review.user.membership_status}
              </span>

              {/* Verified Badges */}
              {review.verified_purchase && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckBadgeIcon className="h-3 w-3 mr-1" />
                  Verified Customer
                </span>
              )}

              {review.user.is_verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <CheckBadgeIcon className="h-3 w-3 mr-1" />
                  Verified Military
                </span>
              )}
            </div>

            {/* Rating and Date */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                {renderStars(review.rating)}
                <span className="font-medium">{review.rating}.0</span>
              </div>
              <span>•</span>
              <span>{timeAgo(review.created_at)}</span>
              {review.service_date && (
                <>
                  <span>•</span>
                  <span>Service: {formatDate(review.service_date)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {review.can_edit && (
            <button
              onClick={() => onEdit(review)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit review"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}

          {review.can_delete && (
            <button
              onClick={() => onDelete(review.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete review"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}

          {!isOwnReview && (
            <button
              onClick={handleReport}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Report review"
            >
              <FlagIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Review Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {review.review_title}
      </h3>

      {/* Review Text */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {displayText}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setShowFullText(!showFullText)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
          >
            {showFullText ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Detailed Ratings */}
      {(review.response_time_rating || review.quality_rating || review.value_rating) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          {review.response_time_rating && (
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Response Time</div>
              {renderStars(review.response_time_rating, 'h-3 w-3')}
            </div>
          )}
          {review.quality_rating && (
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Quality</div>
              {renderStars(review.quality_rating, 'h-3 w-3')}
            </div>
          )}
          {review.value_rating && (
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Value</div>
              {renderStars(review.value_rating, 'h-3 w-3')}
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
        {review.would_recommend !== undefined && (
          <div className="flex items-center">
            <span className={`font-medium ${review.would_recommend ? 'text-green-600' : 'text-red-600'}`}>
              {review.would_recommend ? '👍 Recommends' : '👎 Does not recommend'}
            </span>
          </div>
        )}

        {review.project_cost_range && (
          <div className="flex items-center">
            <span className="text-gray-500">Project cost:</span>
            <span className="ml-1 font-medium">{getCostRangeDisplay(review.project_cost_range)}</span>
          </div>
        )}
      </div>

      {/* Business Response */}
      {review.business_response && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">B</span>
            </div>
            <div>
              <div className="font-medium text-blue-900">Business Response</div>
              <div className="text-sm text-blue-700">
                {review.business_response_date && formatDate(review.business_response_date)}
              </div>
            </div>
          </div>
          <p className="text-blue-800 leading-relaxed">{review.business_response}</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Helpful Button */}
          <button
            onClick={handleHelpfulVote}
            disabled={hasVotedHelpful || isOwnReview}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              hasVotedHelpful
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            } ${isOwnReview ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {hasVotedHelpful ? (
              <HandThumbUpIconSolid className="h-4 w-4" />
            ) : (
              <HandThumbUpIcon className="h-4 w-4" />
            )}
            <span>Helpful ({review.helpful_count})</span>
          </button>
        </div>

        {/* Updated indicator */}
        {review.created_at !== review.updated_at && (
          <div className="text-xs text-gray-500">
            Updated {timeAgo(review.updated_at)}
          </div>
        )}
      </div>
    </motion.div>
  );
}