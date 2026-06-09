import React from 'react';
import { cn } from '../utils/cn';

export const Card = ({ children, className, noPadding = false }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl shadow-xl',
        'border border-gray-100 dark:border-slate-700',
        'transition-all duration-300',
        !noPadding && 'p-8',
        className
      )}
    >
      {children}
    </div>
  );
};
