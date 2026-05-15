import React from 'react';

export const Loader = ({ fullPage = false }) => {
  const loader = (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-spin" 
             style={{ width: '100%', height: '100%', mask: 'radial-gradient(circle at center, transparent 30%, black 70%)' }}>
        </div>
        <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full"></div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return loader;
};

export const SkeletonLoader = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 animate-pulse">
    <SkeletonLoader height="h-6" width="w-3/4" />
    <SkeletonLoader height="h-4" width="w-full" />
    <SkeletonLoader height="h-4" width="w-5/6" />
  </div>
);
