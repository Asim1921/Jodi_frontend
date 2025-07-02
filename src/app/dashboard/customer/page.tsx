// src/app/dashboard/customer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HeartIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  EyeIcon,
  ClockIcon,
  UserCircleIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/hooks/use-auth';
import { api, Business } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BusinessCard } from '@/components/business/business-card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { formatDate, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DashboardStats {
  favoriteBusinesses: number;
  totalReviews: number;
  totalInquiries: number;
  recentActivity: number;
}

interface RecentActivity {
  id: number;
  type: 'review' | 'inquiry' | 'favorite' | 'booking';
  business_name: string;
  business_slug: string;
  description: string;
  created_at: string;
}

function CustomerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    favoriteBusinesses: 0,
    totalReviews: 0,
    totalInquiries: 0,
    recentActivity: 0
  });
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<Business[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        favoriteBusinesses: 12,
        totalReviews: 8,
        totalInquiries: 15,
        recentActivity: 5
      });

      // Mock favorite businesses
      setFavoriteBusinesses([
        {
          id: 1,
          business_name: "Smith Plumbing Services",
          slug: "smith-plumbing",
          description: "Professional plumbing services with over 15 years of experience...",
          business_phone: "15551001",
          business_email: "info@smithplumbing.com",
          website_url: "https://smithplumbing.com",
          full_address: "123 Main St, Austin, TX 73301",
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
          categories: [{ id: 1, name: "Plumbing", icon_class: "fas fa-wrench" }],
          created_at: "2024-01-15T10:00:00Z"
        }
      ]);

      setRecentActivity([
        {
          id: 1,
          type: 'review',
          business_name: 'Smith Plumbing Services',
          business_slug: 'smith-plumbing',
          description: 'You left a 5-star review',
          created_at: '2024-01-20T14:30:00Z'
        },
        {
          id: 2,
          type: 'inquiry',
          business_name: 'Johnson HVAC Solutions',
          business_slug: 'johnson-hvac',
          description: 'You sent an inquiry about emergency service',
          created_at: '2024-01-19T09:15:00Z'
        },
        {
          id: 3,
          type: 'favorite',
          business_name: 'Garcia Legal Services',
          business_slug: 'garcia-legal',
          description: 'You added this business to favorites',
          created_at: '2024-01-18T16:45:00Z'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review': return <StarIconSolid className="h-4 w-4 text-yellow-500" />;
      case 'inquiry': return <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-500" />;
      case 'favorite': return <HeartIconSolid className="h-4 w-4 text-red-500" />;
      case 'booking': return <CalendarIcon className="h-4 w-4 text-green-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const StatCard = ({ icon: Icon, title, value, description, color = "primary" }: {
    icon: any;
    title: string;
    value: number;
    description: string;
    color?: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
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
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: EyeIcon },
    { id: 'favorites', name: 'Favorites', icon: HeartIcon },
    { id: 'reviews', name: 'Reviews', icon: StarIcon },
    { id: 'inquiries', name: 'Inquiries', icon: ChatBubbleLeftRightIcon },
    { id: 'saved-searches', name: 'Saved Searches', icon: BookmarkIcon },
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
                Welcome back, {user?.first_name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your favorite businesses, reviews, and inquiries
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <Link href="/search" className="btn-secondary flex items-center gap-2">
                <MagnifyingGlassIcon className="h-4 w-4" />
                Find Services
              </Link>
              <Link href="/profile" className="btn-primary flex items-center gap-2">
                <UserCircleIcon className="h-4 w-4" />
                Edit Profile
              </Link>
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
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/search"
                  className="flex items-center text-sm text-gray-600 hover:text-primary-600 py-1"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Search Businesses
                </Link>
                <Link
                  href="/categories"
                  className="flex items-center text-sm text-gray-600 hover:text-primary-600 py-1"
                >
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Browse Categories
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center text-sm text-gray-600 hover:text-primary-600 py-1"
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  Settings
                </Link>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard
                        icon={HeartIcon}
                        title="Favorite Businesses"
                        value={stats.favoriteBusinesses}
                        description="Saved for later"
                        color="red"
                      />
                      <StatCard
                        icon={StarIcon}
                        title="Reviews Written"
                        value={stats.totalReviews}
                        description="Help others decide"
                        color="yellow"
                      />
                      <StatCard
                        icon={ChatBubbleLeftRightIcon}
                        title="Inquiries Sent"
                        value={stats.totalInquiries}
                        description="Business connections"
                        color="blue"
                      />
                      <StatCard
                        icon={ClockIcon}
                        title="Recent Activity"
                        value={stats.recentActivity}
                        description="This week"
                        color="green"
                      />
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">
                                  {activity.description} for{' '}
                                  <Link
                                    href={`/businesses/${activity.business_slug}`}
                                    className="font-medium text-primary-600 hover:text-primary-700"
                                  >
                                    {activity.business_name}
                                  </Link>
                                </p>
                                <p className="text-sm text-gray-500">
                                  {timeAgo(activity.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <Link
                          href="/activity"
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View all activity →
                        </Link>
                      </div>
                    </div>

                    {/* Quick Access to Favorites */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Favorite Businesses</h2>
                        <button
                          onClick={() => setActiveTab('favorites')}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View all
                        </button>
                      </div>
                      <div className="p-6">
                        {favoriteBusinesses.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {favoriteBusinesses.slice(0, 2).map((business) => (
                              <BusinessCard key={business.id} business={business} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No favorites yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Start exploring and save businesses you love
                            </p>
                            <Link href="/search" className="btn-primary">
                              Browse Businesses
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'favorites' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Favorite Businesses</h2>
                      <Link href="/search" className="btn-primary flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        Find More
                      </Link>
                    </div>
                    
                    {favoriteBusinesses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteBusinesses.map((business) => (
                          <BusinessCard key={business.id} business={business} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                          No favorites yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Save businesses you're interested in to easily find them later
                        </p>
                        <Link href="/search" className="btn-primary">
                          Start Exploring
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Your Reviews</h2>
                      <span className="text-sm text-gray-600">
                        {stats.totalReviews} reviews written
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                      <StarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Your reviews help others
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Share your experiences with veteran-owned businesses
                      </p>
                      <Link href="/search" className="btn-primary">
                        Find Businesses to Review
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === 'inquiries' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Your Inquiries</h2>
                      <span className="text-sm text-gray-600">
                        {stats.totalInquiries} inquiries sent
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                      <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Connect with businesses
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Send inquiries to get quotes and information
                      </p>
                      <Link href="/search" className="btn-primary">
                        Find Services
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === 'saved-searches' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Saved Searches</h2>
                      <Link href="/search" className="btn-primary flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        New Search
                      </Link>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                      <BookmarkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Save your searches
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Get notified when new businesses match your criteria
                      </p>
                      <Link href="/search" className="btn-primary">
                        Create Search Alert
                      </Link>
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

export default withAuth(CustomerDashboardPage);