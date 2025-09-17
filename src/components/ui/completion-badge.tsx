'use client';

import React from 'react';
import { CheckCircle, User } from 'lucide-react';

interface CompletionBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function CompletionBadge({ 
  percentage, 
  size = 'md', 
  showText = true,
  className = '' 
}: CompletionBadgeProps) {
  const isComplete = percentage >= 100;
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Background circle */}
        <svg 
          className="absolute inset-0 transform -rotate-90" 
          width="100%" 
          height="100%" 
          viewBox="0 0 40 40"
        >
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={isComplete ? "#10b981" : "#3b82f6"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center">
          {isComplete ? (
            <CheckCircle className={`${iconSizes[size]} text-green-600`} />
          ) : (
            <User className={`${iconSizes[size]} text-blue-600`} />
          )}
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-semibold ${isComplete ? 'text-green-700' : 'text-blue-700'}`}>
            {Math.round(percentage)}% complete
          </span>
          {percentage < 100 && (
            <span className="text-xs text-gray-500">
              {100 - Math.round(percentage)}% remaining
            </span>
          )}
        </div>
      )}
    </div>
  );
}
