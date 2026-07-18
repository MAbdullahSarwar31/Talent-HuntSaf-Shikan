import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading intelligence metrics...', rows = 4 }) => {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin opacity-0" />
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-700 mb-1">{message}</p>
      <p className="text-xs text-slate-400">Computing deterministic margins and leakage penalties</p>

      <div className="w-full max-w-lg mt-8 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-100 rounded-md animate-pulse" style={{ width: `${100 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
};
