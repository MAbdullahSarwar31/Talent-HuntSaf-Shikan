import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Intelligence Engine Query Failed',
  message = 'Unable to fetch mission financial records from the database. Please verify your connection or retry.',
  onRetry,
}) => {
  return (
    <div className="w-full bg-rose-50/50 border border-rose-200/80 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-4">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Query
        </button>
      )}
    </div>
  );
};
