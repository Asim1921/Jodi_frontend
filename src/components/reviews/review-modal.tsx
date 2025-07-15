// src/components/reviews/review-modal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReviewForm } from './review-form';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  businessName: string;
  existingReview?: any;
  onSuccess?: (review: any) => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  existingReview,
  onSuccess
}: ReviewModalProps) {
  const handleSuccess = (review: any) => {
    if (onSuccess) {
      onSuccess(review);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {existingReview ? 'Edit Review' : 'Write a Review'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <ReviewForm
                  businessId={businessId}
                  businessName={businessName}
                  existingReview={existingReview}
                  onSuccess={handleSuccess}
                  onCancel={onClose}
                  isModal={false} // We're already in a modal container
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}