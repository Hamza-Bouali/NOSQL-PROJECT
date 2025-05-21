import React, { ReactNode, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  icon?: ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  autoClose = false,
  duration = 5000,
  icon
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  const bgColors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    warning: 'bg-amber-50',
    info: 'bg-blue-50'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-amber-800',
    info: 'text-blue-800'
  };

  const borderColors = {
    success: 'border-green-400',
    error: 'border-red-400',
    warning: 'border-amber-400',
    info: 'border-blue-400'
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  return (
    <div 
      className={`border-l-4 ${borderColors[type]} ${bgColors[type]} p-4 rounded-md mb-4`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {icon || icons[type]}
        </div>
        <div className={`ml-3 ${textColors[type]}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className={`${textColors[type]} hover:opacity-75 focus:outline-none`}
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;