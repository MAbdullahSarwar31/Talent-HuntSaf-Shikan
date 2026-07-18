import React from 'react';
import { DatabaseBackup, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'No mission or financial records match your current filter criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[320px]">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-4 shadow-inner">
        <DatabaseBackup className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
