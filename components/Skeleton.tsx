
import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-white/10 rounded-lg ${className}`}></div>
);

export const QuizSkeleton = () => (
  <div className="space-y-6 w-full max-w-2xl mx-auto p-4">
    <Skeleton className="h-8 w-1/4" />
    <Skeleton className="h-24 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
);
