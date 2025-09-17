'use client';

import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { ValidationResult } from '@/lib/validation';

interface ValidationFeedbackProps {
  validation: ValidationResult;
  className?: string;
  showSuggestions?: boolean;
}

export default function ValidationFeedback({ 
  validation, 
  className = '',
  showSuggestions = true 
}: ValidationFeedbackProps) {
  const { warnings, suggestions } = validation;
  
  if (warnings.length === 0 && suggestions.length === 0) {
    return null;
  }

  const highWarnings = warnings.filter(w => w.severity === 'high');
  const mediumWarnings = warnings.filter(w => w.severity === 'medium');
  const lowWarnings = warnings.filter(w => w.severity === 'low');

  return (
    <div className={`space-y-2 ${className}`}>
      {/* High severity warnings */}
      {highWarnings.map((warning, index) => (
        <div key={`high-${index}`} className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-medium">{warning.message}</p>
          </div>
        </div>
      ))}

      {/* Medium severity warnings */}
      {mediumWarnings.map((warning, index) => (
        <div key={`medium-${index}`} className="flex items-start space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700">
            <p>{warning.message}</p>
          </div>
        </div>
      ))}

      {/* Low severity warnings */}
      {lowWarnings.map((warning, index) => (
        <div key={`low-${index}`} className="flex items-start space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p>{warning.message}</p>
          </div>
        </div>
      ))}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <div key={`suggestion-${index}`} className="flex items-start space-x-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
              <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                <p>{suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact validation indicator for inline use
 */
export function ValidationIndicator({ validation }: { validation: ValidationResult }) {
  const { warnings } = validation;
  
  if (warnings.length === 0) {
    return null;
  }

  const highCount = warnings.filter(w => w.severity === 'high').length;
  const mediumCount = warnings.filter(w => w.severity === 'medium').length;
  const lowCount = warnings.filter(w => w.severity === 'low').length;

  return (
    <div className="flex items-center space-x-1 text-xs">
      {highCount > 0 && (
        <span className="flex items-center text-red-600">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {highCount}
        </span>
      )}
      {mediumCount > 0 && (
        <span className="flex items-center text-yellow-600">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {mediumCount}
        </span>
      )}
      {lowCount > 0 && (
        <span className="flex items-center text-blue-600">
          <Info className="w-3 h-3 mr-1" />
          {lowCount}
        </span>
      )}
    </div>
  );
}
