import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Plane,
  Users,
  AlertTriangle,
  Sliders,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Overview', path: '/', icon: BarChart3 },
    { name: 'Mission Profitability', path: '/missions', icon: TrendingUp },
    { name: 'Fleet Utilization', path: '/fleet', icon: Plane },
    { name: 'Operator Efficiency', path: '/operators', icon: Users },
    { name: 'Leakage Analysis', path: '/leakage', icon: AlertTriangle },
    { name: 'Scoring Rules Engine', path: '/rules', icon: Sliders },
    { name: 'Executive Reports', path: '/reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between flex-shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3 bg-slate-950/40">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md">
            S
          </div>
          <div>
            <div className="font-black text-white text-sm tracking-wide flex items-center gap-1.5">
              SAF SHIKAN
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">
                BI
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Mission Profitability</div>
          </div>
        </div>

        {/* Executive Tier Notice */}
        <div className="px-4 py-3 mx-4 my-4 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-200 font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            Executive Intelligence Layer
          </div>
          Sits directly above Operational & Operator portals to compute true mission margins.
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            BI Analytics & Insights
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-emerald-600/15 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0 opacity-80 group-hover:opacity-100" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Ecosystem Jump */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
          SaaS Agro Portal Links
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900/80 text-xs text-slate-400 hover:text-slate-300 transition-colors cursor-default border border-slate-800">
            <span>Admin Operational Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900/80 text-xs text-slate-400 hover:text-slate-300 transition-colors cursor-default border border-slate-800">
            <span>Operator Flight / Attendance</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </div>
        </div>
      </div>
    </aside>
  );
};
