// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuth, withAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { isValidEmail } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NotificationSettings {
  email_notifications: boolean;
  review_notifications: boolean;
  inquiry_notifications: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  login_alerts: boolean;
  session_timeout: number;
}

function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Email Change State
  const [emailForm, setEmailForm] = useState({
    new_email: '',
    password: ''
  });
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    review_notifications: true,
    inquiry_notifications: true,
    marketing_emails: false,
    security_alerts: true
  });

  // Security State
  const [security, setSecurity] = useState<SecuritySettings>({
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: 30
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // In a real app, you'd fetch user settings from the API
      // For now, we'll use default values
      console.log('Fetching user settings...');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordForm.current_password) {
      errors.current_password = 'Current password is required';
    }

    if (!passwordForm.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordForm.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.new_password)) {
      errors.new_password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!passwordForm.confirm_password) {
      errors.confirm_password = 'Please confirm your new password';
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEmailForm = () => {
    const errors: Record<string, string> = {};

    if (!emailForm.new_email) {
      errors.new_email = 'New email is required';
    } else if (!isValidEmail(emailForm.new_email)) {
      errors.new_email = 'Please enter a valid email address';
    }

    if (!emailForm.password) {
      errors.password = 'Password is required to change email';
    }

    setEmailErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      // API call to change password
      const response = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      });

      if (response.ok) {
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        toast.success('Password changed successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!validateEmailForm()) return;

    setLoading(true);
    try {
      // API call to change email
      const response = await fetch('/api/v1/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(emailForm)
      });

      if (response.ok) {
        setEmailForm({ new_email: '', password: '' });
        toast.success('Email change verification sent to new address');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to change email');
      }
    } catch (error) {
      toast.error('An error occurred while changing email');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (setting: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [setting]: value }));
    
    try {
      // API call to update notification settings
      const response = await fetch('/api/v1/users/notification-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ [setting]: value })
      });

      if (response.ok) {
        toast.success('Notification settings updated');
      }
    } catch (error) {
      // Revert on error
      setNotifications(prev => ({ ...prev, [setting]: !value }));
      toast.error('Failed to update notification settings');
    }
  };

  const handleSecurityUpdate = async (setting: keyof SecuritySettings, value: boolean | number) => {
    setSecurity(prev => ({ ...prev, [setting]: value }));
    
    try {
      // API call to update security settings
      const response = await fetch('/api/v1/users/security-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ [setting]: value })
      });

      if (response.ok) {
        toast.success('Security settings updated');
      }
    } catch (error) {
      // Revert on error
      setSecurity(prev => ({ ...prev, [setting]: typeof value === 'boolean' ? !value : prev[setting] }));
      toast.error('Failed to update security settings');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        await logout();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete account');
      }
    } catch (error) {
      toast.error('An error occurred while deleting account');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: KeyIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'danger', name: 'Danger Zone', icon: ExclamationTriangleIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences and security settings</p>
          </motion.div>

          <div className="lg:flex lg:gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0 mb-8 lg:mb-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Change Password */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                            className={`form-input pr-10 ${passwordErrors.current_password ? 'border-red-300' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.current ? (
                              <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.current_password && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                            className={`form-input pr-10 ${passwordErrors.new_password ? 'border-red-300' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.new ? (
                              <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.new_password && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordForm.confirm_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                            className={`form-input pr-10 ${passwordErrors.confirm_password ? 'border-red-300' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.confirm ? (
                              <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.confirm_password && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.confirm_password}</p>
                        )}
                      </div>

                      <button
                        onClick={handlePasswordChange}
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>

                  {/* Change Email */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Email Address</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Current email: <span className="font-medium">{user?.email}</span>
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Email Address
                        </label>
                        <input
                          type="email"
                          value={emailForm.new_email}
                          onChange={(e) => setEmailForm(prev => ({ ...prev, new_email: e.target.value }))}
                          className={`form-input ${emailErrors.new_email ? 'border-red-300' : ''}`}
                          placeholder="Enter new email address"
                        />
                        {emailErrors.new_email && (
                          <p className="mt-1 text-sm text-red-600">{emailErrors.new_email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={emailForm.password}
                          onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                          className={`form-input ${emailErrors.password ? 'border-red-300' : ''}`}
                          placeholder="Enter your current password"
                        />
                        {emailErrors.password && (
                          <p className="mt-1 text-sm text-red-600">{emailErrors.password}</p>
                        )}
                      </div>

                      <button
                        onClick={handleEmailChange}
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? 'Updating...' : 'Update Email'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-6">
                    {[
                      {
                        key: 'email_notifications' as keyof NotificationSettings,
                        title: 'Email Notifications',
                        description: 'Receive email notifications for important updates'
                      },
                      {
                        key: 'review_notifications' as keyof NotificationSettings,
                        title: 'Review Notifications',
                        description: 'Get notified when someone reviews your business'
                      },
                      {
                        key: 'inquiry_notifications' as keyof NotificationSettings,
                        title: 'Inquiry Notifications',
                        description: 'Receive notifications for new customer inquiries'
                      },
                      {
                        key: 'marketing_emails' as keyof NotificationSettings,
                        title: 'Marketing Emails',
                        description: 'Receive promotional emails and special offers'
                      },
                      {
                        key: 'security_alerts' as keyof NotificationSettings,
                        title: 'Security Alerts',
                        description: 'Get notified about security-related activities'
                      }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{setting.title}</h4>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[setting.key]}
                            onChange={(e) => handleNotificationUpdate(setting.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={security.two_factor_enabled}
                            onChange={(e) => handleSecurityUpdate('two_factor_enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">Login Alerts</h4>
                          <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={security.login_alerts}
                            onChange={(e) => handleSecurityUpdate('login_alerts', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="py-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Session Timeout</h4>
                        <p className="text-sm text-gray-500 mb-3">Automatically log out after inactivity</p>
                        <select
                          value={security.session_timeout}
                          onChange={(e) => handleSecurityUpdate('session_timeout', parseInt(e.target.value))}
                          className="form-select w-40"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={480}>8 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-red-200 p-6"
                >
                  <div className="flex items-center mb-4">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                      This will permanently delete your account, business listings, and all associated data.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                      >
                        <TrashIcon className="h-4 w-4 mr-2 inline" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                          <p className="text-sm text-yellow-800">
                            Are you absolutely sure? This action cannot be undone.
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                          >
                            {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default withAuth(SettingsPage);