// src/components/business/category-grid.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BusinessCategory } from '@/lib/api';

interface CategoryGridProps {
  categories: BusinessCategory[];
  showCount?: boolean;
  className?: string;
}

export function CategoryGrid({ 
  categories, 
  showCount = true, 
  className = '' 
}: CategoryGridProps) {
  // Fixed animation variants - removed transition from variants
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

  return (
    <motion.div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {categories.map((category) => (
        <motion.div
          key={category.id}
          variants={fadeInUp}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/categories/${category.id}`}
            className="group block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all duration-200"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-lg mb-3 group-hover:bg-primary-200 transition-colors duration-200">
                <i className={`${category.icon_class} text-lg`}></i>
              </div>
              
              {/* Category Name */}
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                {category.name}
              </h3>
              
              {/* Business Count */}
              {showCount && (
                <p className="text-xs text-gray-500 mt-1">
                  {category.businesses_count} businesses
                </p>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}