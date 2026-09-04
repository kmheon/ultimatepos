import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ text = 'Loading data...', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className={`${iconSizes[size]} text-blue-600 animate-spin`} />
      <span className="text-xs font-semibold text-slate-500">{text}</span>
    </div>
  );
};
