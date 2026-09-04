import React from 'react';

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full', rows = 1 }) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-200 animate-pulse rounded-xl ${className}`}
        />
      ))}
    </div>
  );
};
