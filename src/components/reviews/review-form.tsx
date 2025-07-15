// src/components/reviews/review-form.tsx - Fixed TypeScript errors
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  businessId: number;
  businessName: string;
  existingReview?: any;
  onSuccess?: (review: any) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

interface ReviewFormData {
  rating: number;
  review_title: string;
  review_text: string;
  service_date: string;
  project_cost_range: string;
  would_recommend: boolean | null;
  response_time_rating: number;
  quality_rating: number;
  value_rating: number;
  verified_purchase: boolean;
}

export function ReviewForm({
  businessId,
  businessName,
  existingReview,
  onSuccess,
  onCancel,
  isModal = false
}: ReviewFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ReviewFormData>({
    rating: existingReview?.rating || 0,
    review_title: existingReview?.review_title || '',
    review_text: existingReview?.review_text || '',
    service_date: existingReview?.service_date || '',
    project_cost_range: existingReview?.project_cost_range || '',
    would_recommend: existingReview?.would_recommend ?? null,
    response_time_rating: existingReview?.response_time_rating || 0,
    quality_rating: existingReview?.quality_rating || 0,
    value_rating: existingReview?.value_rating || 0,
    verified_purchase: existingReview?.verified_purchase ?? false
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formData.review_title.trim()) {
      newErrors.review_title = 'Review title is required';
    } else if (formData.review_title.length > 100) {
      newErrors.review_title = 'Title must be 100 characters or less';
    }

    if (!formData.review_text.trim()) {
      newErrors.review_text = 'Review text is required';
    } else if (formData.review_text.length < 10) {
      newErrors.review_text = 'Review must be at least 10 characters';
    } else if (formData.review_text.length > 1000) {
      newErrors.review_text = 'Review must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let response;
      
      // Prepare data for submission, ensuring proper types
      const submitData = {
        ...formData,
        would_recommend: formData.would_recommend === null ? undefined : formData.would_recommend
      };
      
      if (existingReview) {
        response = await api.reviews.update(businessId, existingReview.id, submitData);
        toast.success('Review updated successfully!');
      } else {
        response = await api.reviews.create(businessId, submitData);
        toast.success('Review submitted successfully!');
      }

      if (onSuccess) {
        onSuccess(response.data.data.review);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
      
      if (error.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: string) => {
          if (err.includes('rating')) apiErrors.rating = err;
          else if (err.includes('title')) apiErrors.review_title = err;
          else if (err.includes('text')) apiErrors.review_text = err;
        });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ReviewFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStars = (rating: number, onRate?: (rating: number) => void, size = 'h-6 w-6') => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onRate?.(i)}
          className={`${size} transition-colors duration-200 ${
            onRate ? 'cursor-pointer hover:scale-110' : ''
          } ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
          disabled={!onRate}
        >
          {filled ? <StarIconSolid /> : <StarIcon />}
        </button>
      );
    }
    
    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const costRanges = [
    { value: '', label: 'Select cost range' },
    { value: 'under_100', label: 'Under $100' },
    { value: '100_500', label: '$100 - $500' },
    { value: '500_1000', label: '$500 - $1,000' },
    { value: '1000_5000', label: '$1,000 - $5,000' },
    { value: '5000_10000', label: '$5,000 - $10,000' },
    { value: 'over_10000', label: 'Over $10,000' }
  ];

  if (!user) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in Required</h3>
        <p className="text-gray-600 mb-4">You need to be signed in to write a review.</p>
        <button className="btn-primary">Sign In</button>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </h3>
          <p className="text-sm text-gray-600">for {businessName}</p>
        </div>
        {isModal && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Overall Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating *
        </label>
        {renderStars(formData.rating, (rating) => handleInputChange('rating', rating))}
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Review Title */}
      <div>
        <label htmlFor="review_title" className="block text-sm font-medium text-gray-700 mb-1">
          Review Title *
        </label>
        <input
          id="review_title"
          type="text"
          value={formData.review_title}
          onChange={(e) => handleInputChange('review_title', e.target.value)}
          className={`form-input ${errors.review_title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Summarize your experience"
          maxLength={100}
        />
        <div className="flex justify-between mt-1">
          {errors.review_title && (
            <p className="text-sm text-red-600">{errors.review_title}</p>
          )}
          <p className="text-xs text-gray-500 ml-auto">
            {formData.review_title.length}/100
          </p>
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-1">
          Your Review *
        </label>
        <textarea
          id="review_text"
          rows={4}
          value={formData.review_text}
          onChange={(e) => handleInputChange('review_text', e.target.value)}
          className={`form-textarea ${errors.review_text ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Tell others about your experience with this business..."
          maxLength={1000}
        />
        <div className="flex justify-between mt-1">
          {errors.review_text && (
            <p className="text-sm text-red-600">{errors.review_text}</p>
          )}
          <p className="text-xs text-gray-500 ml-auto">
            {formData.review_text.length}/1000
          </p>
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Time
          </label>
          {renderStars(
            formData.response_time_rating, 
            (rating) => handleInputChange('response_time_rating', rating),
            'h-5 w-5'
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality of Work
          </label>
          {renderStars(
            formData.quality_rating,
            (rating) => handleInputChange('quality_rating', rating),
            'h-5 w-5'
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value for Money
          </label>
          {renderStars(
            formData.value_rating,
            (rating) => handleInputChange('value_rating', rating),
            'h-5 w-5'
          )}
        </div>
      </div>

      {/* Service Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="service_date" className="block text-sm font-medium text-gray-700 mb-1">
            Service Date
          </label>
          <input
            id="service_date"
            type="date"
            value={formData.service_date}
            onChange={(e) => handleInputChange('service_date', e.target.value)}
            className="form-input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label htmlFor="project_cost_range" className="block text-sm font-medium text-gray-700 mb-1">
            Project Cost Range
          </label>
          <select
            id="project_cost_range"
            value={formData.project_cost_range}
            onChange={(e) => handleInputChange('project_cost_range', e.target.value)}
            className="form-select"
          >
            {costRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommendation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Would you recommend this business?
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={formData.would_recommend === true}
              onChange={() => handleInputChange('would_recommend', true)}
              className="form-radio"
            />
            <span className="ml-2 text-sm text-gray-700">Yes</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={formData.would_recommend === false}
              onChange={() => handleInputChange('would_recommend', false)}
              className="form-radio"
            />
            <span className="ml-2 text-sm text-gray-700">No</span>
          </label>
        </div>
      </div>

      {/* Verified Purchase */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.verified_purchase}
            onChange={(e) => handleInputChange('verified_purchase', e.target.checked)}
            className="form-checkbox"
          />
          <span className="ml-2 text-sm text-gray-700">
            I am a verified customer of this business
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {existingReview ? 'Updating...' : 'Submitting...'}
            </div>
          ) : (
            existingReview ? 'Update Review' : 'Submit Review'
          )}
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        >
          {formContent}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {formContent}
    </div>
  );
}