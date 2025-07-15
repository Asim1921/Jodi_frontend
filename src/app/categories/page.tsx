// src/app/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { api, BusinessCategory } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      const response = await api.categories.list();
      const categoriesData = response.data.data.categories || [];
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const popularCategories = filteredCategories
    .filter(cat => cat.businesses_count > 0)
    .sort((a, b) => b.businesses_count - a.businesses_count)
    .slice(0, 8);

  const allCategoriesGrouped = filteredCategories.reduce((groups, category) => {
    const firstLetter = category.name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(category);
    return groups;
  }, {} as Record<string, BusinessCategory[]>);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-military-800 to-veteran-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container-custom py-16">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Service Categories
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Discover veteran-owned businesses across all service categories. 
              Find the expertise you need from trusted military professionals.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Popular Categories */}
        {popularCategories.length > 0 && (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center mb-8">
              <TagIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Popular Categories</h2>
            </div>
            
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {popularCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  variants={fadeInUp}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={`/categories/${category.id}`}
                    className="group block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all duration-200 p-6"
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                        <i className={`${category.icon_class || 'fas fa-briefcase'} text-xl`}></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-center text-sm text-primary-600 font-medium">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        {category.businesses_count} businesses
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* All Categories A-Z */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">All Categories</h2>
            <div className="text-sm text-gray-600">
              {filteredCategories.length} categories found
            </div>
          </div>

          {searchQuery && filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or browse all categories below.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="btn-primary"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(allCategoriesGrouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, categoryGroup]) => (
                  <motion.div
                    key={letter}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <h3 className="text-xl font-bold text-primary-600 mb-4 pb-2 border-b border-gray-200">
                      {letter}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryGroup.map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.id}`}
                          className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center flex-1">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-600 rounded-full mr-3 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors duration-200">
                              <i className={`${category.icon_class || 'fas fa-briefcase'} text-sm`}></i>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                                {category.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {category.businesses_count} businesses
                              </p>
                            </div>
                          </div>
                          <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors duration-200" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you can't find the specific service category you need, try our advanced search 
              or browse all veteran-owned businesses in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search" className="btn-primary">
                Advanced Search
              </Link>
              <Link href="/businesses" className="btn-secondary">
                Browse All Businesses
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
}