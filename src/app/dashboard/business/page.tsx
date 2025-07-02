// src/app/dashboard/business/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BuildingOfficeIcon,
  ChartBarIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  PencilIcon,
  CameraIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/hooks/use-auth';
import { api, Business } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { formatDate, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BusinessStats {
  totalViews: number;
  totalInquiries: number;
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  profileCompleteness: number;
}

interface RecentInquiry {
  id: number;
  customer_name: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'pending' | 'responded' | 'closed';
}

interface RecentReview {
  id: number;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
  responded: boolean;
}

function BusinessDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState<BusinessStats>({
    totalViews: 0,
    totalInquiries: 0,
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
    profileCompleteness: 0
  });
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock business data
      setBusiness({
        id: 1,
        business_name: "Smith Plumbing Services",
        slug: "smith-plumbing",
        description: "Professional plumbing services with over 15 years of experience. We specialize in residential and commercial plumbing installations, repairs, and emergency services.",
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
      });

      setStats({
        totalViews: 1247,
        totalInquiries: 23,
        totalReviews: 45,
        averageRating: 4.8,
        responseRate: 95,
        profileCompleteness: 85
      });

      setRecentInquiries([
        {
          id: 1,
          customer_name: 'Sarah Johnson',
          subject: 'Emergency Water Leak',
          message: 'Hi, I have a water leak in my kitchen and need immediate assistance. Can you help today?',
          created_at: '2024-01-20T14:30:00Z',
          status: 'pending'
        },
        {
          id: 2,
          customer_name: 'Mike Davis',
          subject: 'Bathroom Renovation Quote',
          message: 'Looking for a quote on complete bathroom plumbing for a renovation project.',
          created_at: '2024-01-19T09:15:00Z',
          status: 'responded'
        }
      ]);

      setRecentReviews([
        {
          id: 1,
          customer_name: 'Jennifer Wilson',
          rating: 5,
          review_text: 'Excellent service! John was professional, on time, and fixed our plumbing issue quickly.',
          created_at: '2024-01-18T16:45:00Z',
          responded: false
        },
        {
          id: 2,
          customer_name: 'Robert Brown',
          rating: 5,
          review_text: 'Great work and fair pricing. Highly recommend Smith Plumbing for any plumbing needs.',
          created_at: '2024-01-17T11:20:00Z',
          responded: true
        }
      ]);

    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileCompletionTasks = () => {
    const tasks = [];
    if (!business?.description || business.description.length < 100) {
      tasks.push({ task: 'Add detailed business description', points: 15 });
    }
    if (!business?.website_url) {
      tasks.push({ task: 'Add website URL', points: 10 });
    }
    if (business?.categories.length === 0) {
      tasks.push({ task: 'Add business categories', points: 10 });
    }
    if (stats.totalReviews < 5) {
      tasks.push({ task: 'Get more customer reviews', points: 20 });
    }
    return tasks;
  };

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    description, 
    color = "primary",
    trend,
    trendDirection = "up"
  }: {
    icon: any;
    title: string;
    value: string | number;
    description: string;
    color?: string;
    trend?: string;
    trendDirection?: "up" | "down";
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${
              trendDirection === 'down' ? 'rotate-180' : ''
            }`} />
            {trend}
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'profile', name: 'Business Profile', icon: BuildingOfficeIcon },
    { id: 'inquiries', name: 'Inquiries', icon: ChatBubbleLeftRightIcon },
    { id: 'reviews', name: 'Reviews', icon: StarIcon },
    { id: 'analytics', name: 'Analytics', icon: EyeIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {business?.business_name || 'Business Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your business profile and customer interactions
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <Link 
                href={`/businesses/${business?.slug}`}
                className="btn-secondary flex items-center gap-2"
                target="_blank"
              >
                <EyeIcon className="h-4 w-4" />
                View Public Profile
              </Link>
              <button 
                onClick={() => setActiveTab('profile')}
                className="btn-primary flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border-primary-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                  {tab.id === 'inquiries' && recentInquiries.filter(i => i.status === 'pending').length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {recentInquiries.filter(i => i.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Business Status Card */}
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center mb-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-900">Business Status</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Status:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification:</span>
                  <span className="text-green-600 font-medium">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Military Status:</span>
                  <span className="text-blue-600 font-medium">Veteran Owned</span>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">Profile Completion</span>
                <span className="text-sm text-gray-600">{stats.profileCompleteness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.profileCompleteness}%` }}
                ></div>
              </div>
              <div className="space-y-1">
                {getProfileCompletionTasks().slice(0, 2).map((task, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    • {task.task} (+{task.points}%)
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <StatCard
                        icon={EyeIcon}
                        title="Profile Views"
                        value={stats.totalViews.toLocaleString()}
                        description="This month"
                        color="blue"
                        trend="+12%"
                        trendDirection="up"
                      />
                      <StatCard
                        icon={ChatBubbleLeftRightIcon}
                        title="New Inquiries"
                        value={stats.totalInquiries}
                        description="This month"
                        color="green"
                        trend="+8%"
                        trendDirection="up"
                      />
                      <StatCard
                        icon={StarIcon}
                        title="Average Rating"
                        value={stats.averageRating.toFixed(1)}
                        description={`${stats.totalReviews} reviews`}
                        color="yellow"
                        trend="+0.2"
                        trendDirection="up"
                      />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                          onClick={() => setActiveTab('profile')}
                          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <PencilIcon className="h-6 w-6 text-primary-600 mr-3" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">Update Profile</div>
                            <div className="text-sm text-gray-600">Edit business information</div>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('inquiries')}
                          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600 mr-3" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">Respond to Inquiries</div>
                            <div className="text-sm text-gray-600">
                              {recentInquiries.filter(i => i.status === 'pending').length} pending
                            </div>
                          </div>
                        </button>
                        <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <CameraIcon className="h-6 w-6 text-purple-600 mr-3" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">Add Photos</div>
                            <div className="text-sm text-gray-600">Showcase your work</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Recent Inquiries */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
                        <button
                          onClick={() => setActiveTab('inquiries')}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View all
                        </button>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {recentInquiries.slice(0, 3).map((inquiry) => (
                          <div key={inquiry.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {inquiry.customer_name}
                                  </h3>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                                    {inquiry.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{inquiry.subject}</p>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {inquiry.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {timeAgo(inquiry.created_at)}
                                </p>
                              </div>
                              {inquiry.status === 'pending' && (
                                <button className="ml-4 btn-primary text-sm">
                                  Respond
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
                        <button
                          onClick={() => setActiveTab('reviews')}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View all
                        </button>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {recentReviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {review.customer_name}
                                  </h3>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIconSolid
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {review.review_text}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {timeAgo(review.created_at)}
                                </p>
                              </div>
                              {!review.responded && (
                                <button className="ml-4 btn-secondary text-sm">
                                  Respond
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
                      <div className="flex gap-3">
                        <Link
                          href={`/businesses/${business?.slug}`}
                          className="btn-secondary flex items-center gap-2"
                          target="_blank"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Preview
                        </Link>
                        <button className="btn-primary flex items-center gap-2">
                          <PencilIcon className="h-4 w-4" />
                          Edit Profile
                        </button>
                      </div>
                    </div>

                    {/* Profile Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Name
                          </label>
                          <p className="text-gray-900">{business?.business_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <p className="text-gray-900">{business?.business_phone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <p className="text-gray-900">{business?.business_email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                          </label>
                          <p className="text-gray-900">{business?.website_url || 'Not provided'}</p>
                        </div>
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <p className="text-gray-900">{business?.description}</p>
                        </div>
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <p className="text-gray-900">{business?.full_address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Business Categories */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {business?.categories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                          >
                            <i className={`${category.icon_class} mr-2`}></i>
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Business Features */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Business Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">Verified</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">Military Owned</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">Emergency Service</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">Insured</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'inquiries' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Customer Inquiries</h2>
                      <div className="text-sm text-gray-600">
                        {recentInquiries.filter(i => i.status === 'pending').length} pending responses
                      </div>
                    </div>

                    <div className="space-y-4">
                      {recentInquiries.map((inquiry) => (
                        <div key={inquiry.id} className="bg-white rounded-lg border border-gray-200 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {inquiry.customer_name}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                                  {inquiry.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{inquiry.subject}</p>
                              <p className="text-sm text-gray-500 mb-2">{inquiry.message}</p>
                              <p className="text-xs text-gray-400">
                                {formatDate(inquiry.created_at)}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              {inquiry.status === 'pending' && (
                                <button className="btn-primary">
                                  Respond
                                </button>
                              )}
                              <button className="btn-secondary">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                      <div className="text-sm text-gray-600">
                        {stats.averageRating.toFixed(1)} average rating • {stats.totalReviews} reviews
                      </div>
                    </div>

                    <div className="space-y-4">
                      {recentReviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {review.customer_name}
                                </h3>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <StarIconSolid
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">{review.review_text}</p>
                              <p className="text-xs text-gray-400">
                                {formatDate(review.created_at)}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              {!review.responded && (
                                <button className="btn-primary">
                                  Respond
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                      <select className="form-select">
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>Last year</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard
                        icon={EyeIcon}
                        title="Profile Views"
                        value={stats.totalViews.toLocaleString()}
                        description="Total views"
                        color="blue"
                      />
                      <StatCard
                        icon={UsersIcon}
                        title="Unique Visitors"
                        value="892"
                        description="Unique visitors"
                        color="green"
                      />
                      <StatCard
                        icon={PhoneIcon}
                        title="Phone Clicks"
                        value="156"
                        description="Phone number clicks"
                        color="purple"
                      />
                      <StatCard
                        icon={EnvelopeIcon}
                        title="Email Clicks"
                        value="89"
                        description="Email clicks"
                        color="red"
                      />
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        Analytics chart would go here
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default withAuth(BusinessDashboardPage, { requiredRole: ['business_owner', 'admin'] });