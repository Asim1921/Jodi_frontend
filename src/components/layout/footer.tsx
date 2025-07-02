// src/components/layout/footer.tsx
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'For Customers': [
      { name: 'Browse Businesses', href: '/businesses' },
      { name: 'Search Services', href: '/search' },
      { name: 'Categories', href: '/categories' },
      { name: 'How It Works', href: '/how-it-works' },
    ],
    'For Business Owners': [
      { name: 'List Your Business', href: '/register' },
      { name: 'Business Dashboard', href: '/dashboard/business' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Success Stories', href: '/success-stories' },
    ],
    'Support': [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Report an Issue', href: '/report' },
      { name: 'Safety Guidelines', href: '/safety' },
    ],
    'Company': [
      { name: 'About Us', href: '/about' },
      { name: 'Our Mission', href: '/mission' },
      { name: 'Veterans Program', href: '/veterans' },
      { name: 'Careers', href: '/careers' },
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: 'fab fa-facebook-f' },
    { name: 'Twitter', href: '#', icon: 'fab fa-twitter' },
    { name: 'LinkedIn', href: '#', icon: 'fab fa-linkedin-in' },
    { name: 'Instagram', href: '#', icon: 'fab fa-instagram' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Logo and Description */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 jodis-gradient rounded-lg">
                <HeartIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading text-white">
                Jodi's List
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Connecting customers with trusted military veteran-owned businesses across all 50 states.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <i className={`${social.icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h3 className="text-lg font-semibold">
                Stay updated with veteran business opportunities
              </h3>
              <p className="mt-2 text-gray-400">
                Get notified about new businesses, special offers, and community events.
              </p>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <form className="sm:flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-600 rounded-l-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:rounded-r-none"
                />
                <button
                  type="submit"
                  className="mt-3 w-full btn-primary sm:mt-0 sm:w-auto sm:rounded-l-none"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center space-x-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} Jodi's List. All rights reserved.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Proudly supporting our veterans</span>
                <HeartIcon className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>🇺🇸 Made in America</span>
                <span>•</span>
                <span>Veteran Owned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}