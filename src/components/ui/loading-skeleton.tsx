// src/components/ui/loading-skeleton.tsx
'use client';

export function LoadingSkeleton({ type = 'business-grid' }: { type?: 'business-grid' | 'business-list' | 'filters' }) {
  if (type === 'business-grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="business-card">
            <div className="skeleton h-48 w-full mb-4"></div>
            <div className="p-6">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text w-3/4"></div>
              <div className="flex items-center gap-2 mt-4">
                <div className="skeleton h-4 w-16"></div>
                <div className="skeleton h-4 w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'filters') {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="skeleton h-5 w-24"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="skeleton h-4 w-full"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="skeleton h-64 w-full"></div>;
}



