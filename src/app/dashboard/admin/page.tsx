// src/app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  BuildingOfficeIcon,
  StarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { withAuth } from '@/hooks/use-auth';
import { api, Business, User } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';


interface DashboardStats {
  totalBusinesses: number;
  totalUsers: number;
  pendingBusinesses: number;
  totalReviews: number;
  averageRating: number;
  recentRegistrations: number;
}

interface RecentActivity {
  id: number;
  type: 'business_registration' | 'user_registration' | 'review_submitted' | 'inquiry_sent';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBusinesses: 0,
    totalUsers: 0,
    pendingBusinesses: 0,
    totalReviews: 0,
    averageRating: 0,
    recentRegistrations: 0
  });
  const [recentBusinesses, setRecentBusinesses] = useState<Business[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const [businessesResponse] = await Promise.all([
        api.businesses.list({ per_page: 100 }),
        // api.admin.users.list(), // You'll need to implement this
      ]);

      const businesses = businessesResponse.data.data.businesses || [];
      const pendingBusinesses = businesses.filter(b => b.business_status === 'pending');
      
      setStats({
        totalBusinesses: businesses.length,
        totalUsers: 150, // Mock data - replace with actual API call
        pendingBusinesses: pendingBusinesses.length,
        totalReviews: businesses.reduce((total, b) => total + b.total_reviews, 0),
        averageRating: businesses.length > 0 
          ? businesses.reduce((total, b) => total + b.average_rating, 0) / businesses.length 
          : 0,
        recentRegistrations: businesses.filter(b => {
          const created = new Date(b.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return created > weekAgo;
        }).length
      });

      // Get recent businesses for review
      setRecentBusinesses(businesses.slice(0, 5));

      // Mock recent activity - replace with actual API
      setRecentActivity([
        {
          id: 1,
          type: 'business_registration',
          title: 'New Business Registration',
          description: 'Smith Plumbing Services submitted for approval',
          timestamp: '2 hours ago',
          status: 'pending'
        },
        {
          id: 2,
          type: 'user_registration',
          title: 'New User Registration',
          description: 'john.doe@email.com signed up',
          timestamp: '4 hours ago'
        },
        {
          id: 3,
          type: 'review_submitted',
          title: 'Review Submitted',
          description: '5-star review for Johnson HVAC Solutions',
          timestamp: '6 hours ago'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Businesses',
      value: stats.totalBusinesses,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingBusinesses,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: '+3',
      changeType: 'neutral'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: StarIcon,
      color: 'bg-purple-500',
      change: '+0.2',
      changeType: 'positive'
    }
  ];

  const quickActions = [
    {
      title: 'Review Businesses',
      description: `${stats.pendingBusinesses} businesses pending approval`,
      icon: CheckCircleIcon,
      href: '/admin/businesses/pending',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'View Analytics',
      description: 'Detailed platform analytics',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'System Reports',
      description: 'Generate system reports',
      href: '/admin/reports',
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your platform and monitor performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <motion.a
                    key={action.title}
                    href={action.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`${action.color} p-2 rounded-lg`}>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity & Pending Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className={`p-2 rounded-full ${
                      activity.type === 'business_registration' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'user_registration' ? 'bg-green-100 text-green-600' :
                      activity.type === 'review_submitted' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'business_registration' && <BuildingOfficeIcon className="h-4 w-4" />}
                      {activity.type === 'user_registration' && <UsersIcon className="h-4 w-4" />}
                      {activity.type === 'review_submitted' && <StarIcon className="h-4 w-4" />}
                      {activity.type === 'inquiry_sent' && <PhoneIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                    {activity.status && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activity.status}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Businesses */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Business Registrations</h2>
                <a href="/admin/businesses" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all
                </a>
              </div>
              <div className="space-y-4">
                {recentBusinesses.map((business, index) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{business.business_name}</h3>
                      <p className="text-sm text-gray-600">{business.city}, {business.state}</p>
                      <div className="flex items-center mt-1 space-x-4">
                        <span className="text-xs text-gray-500">
                          {business.categories.slice(0, 2).map(cat => cat.name).join(', ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(business.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        business.business_status === 'approved' ? 'bg-green-100 text-green-800' :
                        business.business_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {business.business_status}
                      </span>
                      {business.military_owned && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-military-100 text-military-800">
                          Veteran
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminDashboard, { 
  requiredRole: ['admin'],
  redirectTo: '/login' 
});