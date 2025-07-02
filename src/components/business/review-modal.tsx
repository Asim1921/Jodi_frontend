// src/components/business/review-modal.tsx
'use client';

import { useState } from 'react';
import { 
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Business } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  business: Business;
  onClose: () => void;
  onSubmit: (reviewData: any) => void;
}

export function ReviewModal({ business, onClose, onSubmit }: ReviewModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review: '',
    wouldRecommend: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to write a review.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <a href="/login" className="flex-1 btn-primary text-center">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.review.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit({
        business_id: business.id,
        rating: formData.rating,
        review_title: formData.title,
        review_text: formData.review,
        would_recommend: formData.wouldRecommend
      });
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Write a Review</h2>
            <p className="text-sm text-gray-600">{business.business_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating *
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="p-1 hover:scale-110 transition-transform duration-200"
                  >
                    {star <= formData.rating ? (
                      <StarIconSolid className="h-8 w-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-300" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formData.rating > 0 && (
                  <>
                    {formData.rating === 1 && 'Poor'}
                    {formData.rating === 2 && 'Fair'}
                    {formData.rating === 3 && 'Good'}
                    {formData.rating === 4 && 'Very Good'}
                    {formData.rating === 5 && 'Excellent'}
                  </>
                )}
              </p>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input w-full"
                placeholder="Summarize your experience..."
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review *
              </label>
              <textarea
                required
                rows={5}
                value={formData.review}
                onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
                className="form-textarea w-full"
                placeholder="Tell others about your experience with this business..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.review.length}/500 characters
              </p>
            </div>

            {/* Recommendation */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.wouldRecommend}
                  onChange={(e) => setFormData(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                  className="form-checkbox text-primary-600"
                />
                <span className="ml-3 text-sm text-gray-700">
                  I would recommend this business to others
                </span>
              </label>
            </div>

            {/* Guidelines */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Review Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Be honest and fair in your review</li>
                <li>• Focus on your personal experience</li>
                <li>• Avoid profanity or inappropriate content</li>
                <li>• Don't include personal information</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}