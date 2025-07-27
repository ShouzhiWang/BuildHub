import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  onClose, 
  className = '' 
}) => {
  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700'
  };

  const iconClasses = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    success: 'text-green-500'
  };

  return (
    <div className={`border rounded-lg p-4 flex items-start ${typeClasses[type]} ${className}`}>
      <XCircleIcon className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${iconClasses[type]}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close error message"
        >
          <XCircleIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 