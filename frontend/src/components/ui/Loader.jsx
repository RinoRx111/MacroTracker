import React from 'react';

export const Loader = ({ fullPage = false }) => {
  const loader = (
    <div className="flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[var(--border-main)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-[rgba(15,20,16,0.6)] backdrop-blur-sm flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return loader;
};

export const SkeletonLoader = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`${width} ${height} bg-[var(--bg-card-tint)] rounded animate-pulse ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 space-y-4 animate-pulse">
    <SkeletonLoader height="h-6" width="w-3/4" />
    <SkeletonLoader height="h-4" width="w-full" />
    <SkeletonLoader height="h-4" width="w-5/6" />
  </div>
);
