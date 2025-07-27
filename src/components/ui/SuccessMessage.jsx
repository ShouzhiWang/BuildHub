import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const SuccessMessage = ({ 
  message, 
  onClose, 
  className = '',
  autoHide = true,
  duration = 5000 
}) => {
  React.useEffect(() => {
    if (autoHide && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onClose, duration]);

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 flex items-start ${className}`}>
      <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-700">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-green-400 hover:text-green-600 transition-colors"
          aria-label="Close success message"
        >
          <CheckCircleIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SuccessMessage; 