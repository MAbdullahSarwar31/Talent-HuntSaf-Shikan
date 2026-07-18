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
    default: 'border-slate-200/80 hover:border-slate-300',
    positive: 'border-emerald-200/80 bg-emerald-50/20 hover:border-emerald-300',
    warning: 'border-amber-200/80 bg-amber-50/20 hover:border-amber-300',
    critical: 'border-rose-200/80 bg-rose-50/20 hover:border-rose-300',
  };

  const iconColors = {
    default: 'bg-slate-100 text-slate-700',
    positive: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-rose-100 text-rose-700',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-xl p-5 border shadow-sm transition-all duration-200 flex flex-col justify-between',
        borderColors[variant]
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', iconColors[variant])}>
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
          {value}
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={clsx(
                'inline-flex items-center font-semibold px-1.5 py-0.5 rounded',
                trend.isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              )}
            >
              {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
