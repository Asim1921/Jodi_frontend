// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  StarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuth, withAuth } from '@/hooks/use-auth';
import { api, User } from '@/lib/api';
import { isValidEmail, isValidPhone, formatPhoneNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

interface MilitaryBackground {
  id: number;
  military_relationship: string;
  branch_of_service?: string;
  rank?: string;
  mos_specialty?: string;
  service_start_date?: string;
  service_end_date?: string;
  additional_info?: string;
  verified: boolean;
}

interface UserBusiness {
  id: number;
  business_name: string;
  slug: string;
  business_status: string;
  city: string;
  state: string;
  average_rating: number;
  total_reviews: number;
  featured: boolean;
  verified: boolean;
}

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [militaryBackground, setMilitaryBackground] = useState<MilitaryBackground | null>(null);
  const [userBusiness, setUserBusiness] = useState<UserBusiness | null>(null);
  const [dataFetched, setDataFetched] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !dataFetched) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || ''
      });
      fetchUserDetails();
    }
  }, [user, dataFetched]);

  const fetchUserDetails = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user data
      const userResponse = await api.auth.me();
      updateUser(userResponse.data.data);

      // Try to fetch military background (may not exist)
      try {
        const militaryResponse = await api.militaryBackgrounds.get(user.id);
        if (militaryResponse.data.success && militaryResponse.data.data?.military_background) {
          setMilitaryBackground(militaryResponse.data.data.military_background);
        }
      } catch (error: any) {
        // Military background doesn't exist - this is fine for 404 errors
        if (error.response?.status !== 404) {
          console.error('Error fetching military background:', error);
        }
      }

      // Try to fetch business if user is business owner
      if (user.role === 'business_owner') {
        try {
          const businessResponse = await api.businesses.list({ 
            // Note: The backend doesn't seem to support user_id filter directly
            // You might need to modify the backend or use a different approach
          });
          if (businessResponse.data.success && businessResponse.data.data?.businesses && businessResponse.data.data.businesses.length > 0) {
            // Filter businesses by current user on frontend for now
            const userBusinesses = businessResponse.data.data.businesses.filter(
              (business: any) => business.owner?.name === `${user.first_name} ${user.last_name}`
            );
            if (userBusinesses.length > 0) {
              setUserBusiness(userBusinesses[0]);
            }
          }
        } catch (error) {
          // No business found - this is fine
          console.log('No business found for user');
        }
      }

      setDataFetched(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    setSaving(true);
    try {
      const response = await api.users.update(user.id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined
      });

      if (response.data.success) {
        updateUser(response.data.data.user);
        setEditMode(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.message || 'An error occurred while updating your profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || ''
      });
    }
    setErrors({});
    setEditMode(false);
  };

  const getMembershipStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      veteran: 'bg-military-100 text-military-800',
      spouse: 'bg-purple-100 text-purple-800',
      member: 'bg-blue-100 text-blue-800',
      supporter: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.supporter;
  };

  const getBusinessStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="skeleton h-32 w-full rounded-lg"></div>
              <div className="skeleton h-64 w-full rounded-lg"></div>
              <div className="skeleton h-48 w-full rounded-lg"></div>
            </div>
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
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8"
          >
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mr-6">
                    <UserIcon className="h-10 w-10 text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </h1>
                    <p className="text-gray-600 capitalize">
                      {user?.role.replace('_', ' ')}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMembershipStatusColor(user?.membership_status || '')}`}>
                        {user?.membership_status}
                      </span>
                      {militaryBackground?.verified && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          Military Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-secondary"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="btn-secondary"
                      disabled={saving}
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        className={`form-input ${errors.first_name ? 'border-red-300' : ''}`}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.first_name}</p>
                    )}
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        className={`form-input ${errors.last_name ? 'border-red-300' : ''}`}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.last_name}</p>
                    )}
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.email}</p>
                    )}
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className={`form-input ${errors.phone ? 'border-red-300' : ''}`}
                        placeholder="(555) 123-4567"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user?.phone ? formatPhoneNumber(user.phone) : 'Not provided'}
                      </p>
                    )}
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Military Background */}
              {militaryBackground && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Military Background</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Military Relationship
                      </label>
                      <p className="text-gray-900 capitalize">
                        {militaryBackground.military_relationship.replace('_', ' ')}
                      </p>
                    </div>

                    {militaryBackground.branch_of_service && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branch of Service
                        </label>
                        <p className="text-gray-900">{militaryBackground.branch_of_service}</p>
                      </div>
                    )}

                    {militaryBackground.rank && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rank
                        </label>
                        <p className="text-gray-900">{militaryBackground.rank}</p>
                      </div>
                    )}

                    {militaryBackground.mos_specialty && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          MOS/Specialty
                        </label>
                        <p className="text-gray-900">{militaryBackground.mos_specialty}</p>
                      </div>
                    )}
                  </div>

                  {militaryBackground.additional_info && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Information
                      </label>
                      <p className="text-gray-900">{militaryBackground.additional_info}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Add Military Background Button (if none exists) */}
              {!militaryBackground && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Military Background</h2>
                  <p className="text-gray-600 mb-4">
                    Add your military background to get verified and access additional benefits.
                  </p>
                  <button className="btn-primary">
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Add Military Background
                  </button>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Business Information */}
              {userBusiness && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Business</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{userBusiness.business_name}</h4>
                      <p className="text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 inline mr-1" />
                        {userBusiness.city}, {userBusiness.state}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{userBusiness.average_rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span>{userBusiness.total_reviews} reviews</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBusinessStatusColor(userBusiness.business_status)}`}>
                        {userBusiness.business_status}
                      </span>
                      {userBusiness.featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                      {userBusiness.verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Link
                        href={`/businesses/${userBusiness.slug}`}
                        className="btn-secondary w-full text-center"
                      >
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        View Business
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Link
                    href="/settings"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Account Settings
                  </Link>
                  
                  {user?.role === 'business_owner' && (
                    <Link
                      href="/dashboard/business"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                      Business Dashboard
                    </Link>
                  )}
                  
                  <Link
                    href="/help"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Help & Support
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default withAuth(ProfilePage);