import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'positive' | 'warning' | 'critical';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
}) => {
  const borderColors = {
    default: 'border-[#E3ECE7] hover:border-[#C8DDD2]',
    positive: 'border-emerald-200/80 bg-[#F0F7F4] hover:border-emerald-300',
    warning: 'border-amber-200/80 bg-amber-50/30 hover:border-amber-300',
    critical: 'border-rose-200/80 bg-rose-50/30 hover:border-rose-300',
  };

  const iconColors = {
    default: 'bg-[#F0F7F4] text-[#0B4F36]',
    positive: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-rose-100 text-rose-700',
  };

  const dotColors = {
    default: 'bg-[#0B4F36]',
    positive: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl p-4 sm:p-6 border shadow-[0_2px_12px_-3px_rgba(11,79,54,0.06)] transition-all duration-200 flex flex-col justify-between hover:shadow-md select-none',
        borderColors[variant]
      )}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A6B5D] truncate">
          {title}
        </span>
        {icon && (
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0', iconColors[variant])}>
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B3B24] mb-1.5 break-words">
          {value}
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold text-[#4A6B5D]">
          <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', dotColors[variant])} />
          {trend && (
            <span
              className={clsx(
                'inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px]',
                trend.isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              )}
            >
              {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5 flex-shrink-0" /> : <ArrowDownRight className="w-3 h-3 mr-0.5 flex-shrink-0" />}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
