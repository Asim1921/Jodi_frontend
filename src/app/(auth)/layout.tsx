// src/app/(auth)/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Jodi\'s List',
    default: 'Authentication | Jodi\'s List'
  },
  description: 'Sign in or create an account to access Jodi\'s List - the premier directory of military veteran-owned businesses.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}