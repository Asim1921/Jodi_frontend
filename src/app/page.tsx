// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  StarIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { api, Business, BusinessCategory } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BusinessCard } from '@/components/business/business-card';
import { SearchBar } from '@/components/search/search-bar';
import { CategoryGrid } from '@/components/business/category-grid';

export default function HomePage() {
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalVeterans: 0,
    totalCategories: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredResponse, categoriesResponse, statsResponse] = await Promise.all([
          api.public.featured(),
          api.categories.list(),
          api.public.statistics()
        ]);

        setFeaturedBusinesses(featuredResponse.data.data.businesses || []);
        setCategories(categoriesResponse.data.data.categories || []);
        setStats(statsResponse.data.data || stats);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fixed animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUpChild = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-military-800 to-veteran-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container-custom py-20 lg:py-32">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold font-heading mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Connect with{' '}
              <span className="text-yellow-400">Trusted</span>{' '}
              Military Veteran Businesses
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Find reliable service providers who understand your values. 
              Supporting veteran-owned businesses across all 50 states.
            </motion.p>

            {/* Hero Search */}
            <motion.div 
              className="max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <SearchBar 
                placeholder="Search for services (plumbing, legal, HVAC...)"
                showLocation={true}
                className="bg-white/95 backdrop-blur"
              />
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                { icon: UsersIcon, label: 'Veteran Businesses', value: stats.totalBusinesses },
                { icon: CheckBadgeIcon, label: 'Verified Services', value: stats.totalVeterans },
                { icon: StarIcon, label: 'Customer Reviews', value: stats.totalReviews },
                { icon: ShieldCheckIcon, label: 'Service Categories', value: stats.totalCategories }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={fadeInUpChild}
                  transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}+</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Popular Service Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse by category to find the right veteran-owned business for your needs
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CategoryGrid categories={categories.slice(0, 12)} />
            </motion.div>
          )}

          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              href="/categories"
              className="btn-secondary"
            >
              View All Categories
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Featured Veteran Businesses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover highly-rated, verified businesses owned by military veterans
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="business-card">
                  <div className="skeleton h-48 w-full mb-4"></div>
                  <div className="p-6">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {featuredBusinesses.slice(0, 6).map((business, index) => (
                <motion.div 
                  key={business.id} 
                  variants={fadeInUpChild}
                  transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
                >
                  <BusinessCard business={business} featured />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link 
              href="/businesses"
              className="btn-primary"
            >
              Browse All Businesses
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-military-50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Why Choose Jodi's List?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Supporting those who served while getting quality service
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              {
                icon: ShieldCheckIcon,
                title: 'Verified Veterans',
                description: 'All businesses are verified military veteran-owned with proper documentation.'
              },
              {
                icon: StarIcon,
                title: 'Quality Guaranteed',
                description: 'Read real reviews from customers and choose with confidence.'
              },
              {
                icon: UsersIcon,
                title: 'Supporting Heroes',
                description: 'Every hire directly supports veterans transitioning to civilian careers.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                variants={fadeInUpChild}
                transition={{ duration: 0.4, delay: 0.2 + (index * 0.2) }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 jodis-gradient">
        <div className="container-custom text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Whether you're looking for services or want to list your veteran-owned business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/businesses/search"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                Find Services
              </Link>
              <Link 
                href="/register"
                className="btn-secondary border-white text-white hover:bg-white/10"
              >
                List Your Business
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}