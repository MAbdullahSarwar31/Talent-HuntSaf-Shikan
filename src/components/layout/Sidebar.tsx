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
  ExternalLink,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel: Fixed drawer on mobile, static aside on desktop */}
      <aside
        className={clsx(
          'bg-[#0B4F36] border-r border-[#0D5C3E] text-emerald-100 flex flex-col justify-between flex-shrink-0 min-h-screen shadow-2xl md:shadow-xl select-none z-50',
          'fixed inset-y-0 left-0 w-72 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Brand Header matching SAF SHIKAN Admin Portal */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#0D5C3E] gap-3 bg-[#083D2A]/80">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0B4F36] font-black text-xl shadow-md flex-shrink-0">
                S
              </div>
              <div>
                <div className="font-black text-white text-sm tracking-wider flex items-center gap-1.5">
                  SAF SHIKAN
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase border border-emerald-400/30">
                    BI
                  </span>
                </div>
                <div className="text-[11px] text-emerald-200/80 font-semibold tracking-wide">ADMIN PORTAL</div>
              </div>
            </div>

            {/* Mobile Drawer Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-[#136C4A] md:hidden transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
              BI Analytics & Insights
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group min-h-[44px]',
                      isActive
                        ? 'bg-[#136C4A] text-white shadow-md border border-[#1E8A5E]'
                        : 'text-emerald-100/80 hover:text-white hover:bg-[#0E5C3F]'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0 opacity-85 group-hover:opacity-100" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User/Ecosystem Bar matching screenshot */}
        <div className="p-4 border-t border-[#0D5C3E] bg-[#083D2A]/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#136C4A] border border-[#1E8A5E] text-white font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                S
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight">Saf Shikan Admin</div>
                <div className="text-[10px] text-emerald-300/90 font-semibold uppercase tracking-wider">
                  ADMIN ACCESS
                </div>
              </div>
            </div>
            <button
              title="SaaS Portal Navigation"
              className="p-2 rounded-lg hover:bg-[#136C4A] text-emerald-200 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="pt-2 border-t border-[#0D5C3E]/60 space-y-1">
            <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#0B4F36]/80 text-[11px] text-emerald-200/80 hover:text-white transition-colors cursor-default border border-[#0D5C3E]">
              <span>Admin Operational Portal</span>
              <ExternalLink className="w-3 h-3 text-emerald-300/60 flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#0B4F36]/80 text-[11px] text-emerald-200/80 hover:text-white transition-colors cursor-default border border-[#0D5C3E]">
              <span>Operator Flight / Attendance</span>
              <ExternalLink className="w-3 h-3 text-emerald-300/60 flex-shrink-0" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
