// src/app/(auth)/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  HeartIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/use-auth';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    membership_status: 'supporter',
    business_name: '',
    driver_license: '',
    dd214_number: '',
    terms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but validate if provided)
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    // Business owner specific validations
    if (formData.role === 'business_owner') {
      if (!formData.business_name.trim()) {
        newErrors.business_name = 'Business name is required for business owners';
      } else if (formData.business_name.trim().length < 2) {
        newErrors.business_name = 'Business name must be at least 2 characters';
      }

      if (!formData.driver_license.trim()) {
        newErrors.driver_license = 'Driver license number is required for business owners';
      }

      // DD214 number is optional but validate format if provided
      if (formData.dd214_number.trim() && formData.dd214_number.trim().length < 5) {
        newErrors.dd214_number = 'DD214 number must be at least 5 characters if provided';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
        role: formData.role,
        membership_status: formData.membership_status,
        // Business-specific fields
        ...(formData.role === 'business_owner' && {
          business_name: formData.business_name.trim(),
          driver_license: formData.driver_license.trim(),
          dd214_number: formData.dd214_number.trim() || undefined,
        })
      };

      const success = await register(userData);
      
      if (success) {
        router.push('/');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear business-specific errors when role changes away from business_owner
    if (field === 'role' && value !== 'business_owner') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.business_name;
        delete newErrors.driver_license;
        delete newErrors.dd214_number;
        return newErrors;
      });
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image/Content */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-military-600 via-primary-600 to-veteran-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl font-bold font-heading mb-6">
                  Join Our Community
                </h1>
                <p className="text-xl text-gray-200 mb-8">
                  Whether you're looking for services or own a veteran business, 
                  join thousands who are supporting our military community.
                </p>
                <div className="space-y-4 text-left">
                  {[
                    'Connect with verified veteran-owned businesses',
                    'Support military families and their enterprises',
                    'Access quality services from trusted providers',
                    'Join a community that honors service'
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (index * 0.1) }}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-200">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:flex-none lg:px-16 xl:px-20 max-h-screen overflow-y-auto">
        <div className="mx-auto w-full max-w-md lg:w-full lg:max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 jodis-gradient rounded-lg">
                <HeartIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading jodis-gradient-text">
                Jodi's List
              </span>
            </Link>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 font-heading">
                Create your account
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Join our community and start connecting today
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'customer', label: 'Customer', description: 'Looking for services' },
                    { value: 'business_owner', label: 'Business Owner', description: 'Own a veteran business' },
                    { value: 'admin', label: 'Administrator', description: 'Platform administrator' }
                  ].map((role) => (
                    <label
                      key={role.value}
                      className={`relative flex cursor-pointer rounded-lg border p-3 hover:bg-gray-50 ${
                        formData.role === role.value 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="form-radio text-primary-600"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {role.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {role.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                )}
              </div>

              {/* Membership Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Military Relationship
                </label>
                <select
                  value={formData.membership_status}
                  onChange={(e) => handleInputChange('membership_status', e.target.value)}
                  className="form-select"
                >
                  <option value="supporter">Supporter</option>
                  <option value="member">Member</option>
                  <option value="spouse">Military Spouse</option>
                  <option value="veteran">Veteran</option>
                </select>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="first_name"
                      type="text"
                      autoComplete="given-name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className={`form-input pl-9 text-sm ${errors.first_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="John"
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={`form-input text-sm ${errors.last_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Smith"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Business Owner Specific Fields */}
              {formData.role === 'business_owner' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 border-t pt-4"
                >
                  <h3 className="text-md font-medium text-gray-900 flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2 text-primary-600" />
                    Business Information
                  </h3>
                  
                  {/* Business Name */}
                  <div>
                    <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="business_name"
                        type="text"
                        value={formData.business_name}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        className={`form-input pl-9 text-sm ${errors.business_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="ABC Construction LLC"
                      />
                    </div>
                    {errors.business_name && (
                      <p className="mt-1 text-xs text-red-600">{errors.business_name}</p>
                    )}
                  </div>

                  {/* Driver License */}
                  <div>
                    <label htmlFor="driver_license" className="block text-sm font-medium text-gray-700 mb-1">
                      Driver License Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdentificationIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="driver_license"
                        type="text"
                        value={formData.driver_license}
                        onChange={(e) => handleInputChange('driver_license', e.target.value)}
                        className={`form-input pl-9 text-sm ${errors.driver_license ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="DL123456789"
                      />
                    </div>
                    {errors.driver_license && (
                      <p className="mt-1 text-xs text-red-600">{errors.driver_license}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Required for business verification
                    </p>
                  </div>

                  {/* DD214 Number */}
                  <div>
                    <label htmlFor="dd214_number" className="block text-sm font-medium text-gray-700 mb-1">
                      DD214 Number <span className="text-gray-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="dd214_number"
                        type="text"
                        value={formData.dd214_number}
                        onChange={(e) => handleInputChange('dd214_number', e.target.value)}
                        className={`form-input pl-9 text-sm ${errors.dd214_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="DD214-123456789"
                      />
                    </div>
                    {errors.dd214_number && (
                      <p className="mt-1 text-xs text-red-600">{errors.dd214_number}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      For veteran verification
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`form-input pl-9 text-sm ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number <span className="text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`form-input pl-9 text-sm ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`form-input pl-9 pr-9 text-sm ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            passwordStrength < 50 ? 'bg-red-500' :
                            passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {passwordStrength < 50 ? 'Weak' :
                         passwordStrength < 75 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`form-input pl-9 pr-9 text-sm ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={formData.terms}
                    onChange={(e) => handleInputChange('terms', e.target.checked)}
                    className={`form-checkbox mt-1 ${errors.terms ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="mt-1 text-xs text-red-600">{errors.terms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            {/* Sign in link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}