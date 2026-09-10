import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      <div className="h-8 bg-slate-800/80 rounded-xl w-1/3" />
      <div className="h-28 bg-slate-800/60 rounded-2xl w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-800/50 rounded-2xl" />
        ))}
      </div>
      <div className="h-48 bg-slate-800/40 rounded-2xl w-full" />
    </div>
  );
};
