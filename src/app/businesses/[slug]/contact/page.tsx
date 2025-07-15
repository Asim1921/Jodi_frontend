// src/app/businesses/[slug]/contact/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api, Business } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { formatPhoneNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ContactForm {
  subject: string;
  message: string;
  contact_phone: string;
  preferred_contact_method: 'email' | 'phone';
  preferred_contact_time: string;
}

export default function BusinessContactPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<ContactForm>({
    subject: '',
    message: '',
    contact_phone: user?.phone || '',
    preferred_contact_method: 'email',
    preferred_contact_time: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBusiness();
  }, [params.slug]);

  const fetchBusiness = async () => {
    try {
      const response = await api.businesses.get(params.slug as string);
      setBusiness(response.data.data.business);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Business not found');
      router.push('/businesses');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    if (formData.preferred_contact_method === 'phone' && !formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Phone number is required when phone contact is preferred';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to contact businesses');
      router.push('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Create inquiry
      await api.businesses.createInquiry(business!.id, formData);
      
      setSubmitted(true);
      toast.success('Your message has been sent successfully!');
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        contact_phone: user.phone || '',
        preferred_contact_method: 'email',
        preferred_contact_time: ''
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
            <p className="text-gray-600 mb-8">The business you're looking for doesn't exist.</p>
            <button 
              onClick={() => router.push('/businesses')}
              className="btn-primary"
            >
              Browse Businesses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <a href="/businesses" className="hover:text-primary-600">Businesses</a>
          <span>/</span>
          <a href={`/businesses/${business.slug}`} className="hover:text-primary-600">{business.business_name}</a>
          <span>/</span>
          <span className="text-gray-900">Contact</span>
        </nav>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
            >
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h2>
                  <p className="text-gray-600 mb-6">
                    Your message has been sent to {business.business_name}. 
                    They will get back to you soon.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-secondary"
                    >
                      Send Another Message
                    </button>
                    <button
                      onClick={() => router.push(`/businesses/${business.slug}`)}
                      className="btn-primary"
                    >
                      Back to Business Profile
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Contact {business.business_name}
                    </h1>
                    <p className="text-gray-600">
                      Send a message to this veteran-owned business to inquire about their services.
                    </p>
                  </div>

                  {!user && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800">Sign in required</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            You need to <a href="/login" className="underline">sign in</a> to contact businesses.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className={`form-input ${errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="What can they help you with?"
                        disabled={!user}
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className={`form-textarea ${errors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Please describe your project or inquiry in detail..."
                        disabled={!user}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        {formData.message.length}/2000 characters
                      </p>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Phone Number
                        </label>
                        <input
                          type="tel"
                          id="contact_phone"
                          value={formData.contact_phone}
                          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                          className={`form-input ${errors.contact_phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="(555) 123-4567"
                          disabled={!user}
                        />
                        {errors.contact_phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="preferred_contact_method" className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Contact Method
                        </label>
                        <select
                          id="preferred_contact_method"
                          value={formData.preferred_contact_method}
                          onChange={(e) => handleInputChange('preferred_contact_method', e.target.value as 'email' | 'phone')}
                          className="form-select"
                          disabled={!user}
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                        </select>
                      </div>
                    </div>

                    {/* Preferred Contact Time */}
                    <div>
                      <label htmlFor="preferred_contact_time" className="block text-sm font-medium text-gray-700 mb-1">
                        Best Time to Contact (Optional)
                      </label>
                      <input
                        type="text"
                        id="preferred_contact_time"
                        value={formData.preferred_contact_time}
                        onChange={(e) => handleInputChange('preferred_contact_time', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Weekdays 9 AM - 5 PM"
                        disabled={!user}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!user || submitting}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending Message...
                        </div>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>

          {/* Business Info Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{business.business_name}</h2>
                <p className="text-gray-600 text-sm line-clamp-3">{business.description}</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                {business.business_phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <a 
                        href={`tel:${business.business_phone}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {formatPhoneNumber(business.business_phone)}
                      </a>
                    </div>
                  </div>
                )}

                {business.business_email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <a 
                        href={`mailto:${business.business_email}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {business.business_email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{business.city}, {business.state}</p>
                  </div>
                </div>

                {business.website_url && (
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Website</p>
                      <a 
                        href={business.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Features */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Business Features</h3>
                <div className="space-y-2">
                  {business.verified && (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Verified Business</span>
                    </div>
                  )}
                  {business.military_owned && (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-military-600 mr-2" />
                      <span className="text-sm text-gray-600">Veteran Owned</span>
                    </div>
                  )}
                  {business.insured && (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600">Insured</span>
                    </div>
                  )}
                  {business.emergency_service && (
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-600">Emergency Service</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Customer Rating</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(business.average_rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {business.average_rating.toFixed(1)} ({business.total_reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {business.categories.map((category) => (
                    <span
                      key={category.id}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Back to Profile Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push(`/businesses/${business.slug}`)}
                  className="w-full btn-secondary"
                >
                  View Full Profile
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}