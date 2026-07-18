import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-3xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
};
