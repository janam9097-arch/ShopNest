import { AlertTriangle, X } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`bg-error-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 ${className}`}>
      <AlertTriangle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-800">
          {typeof message === 'object' ? JSON.stringify(message) : message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-error-600 hover:text-error-700"
          >
            Try again
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
