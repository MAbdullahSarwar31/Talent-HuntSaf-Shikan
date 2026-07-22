import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { logout } from '../../services/api/authService';
import { ROUTES } from '../../constants/routes';
import {
  LayoutDashboard,
  TrendingUp,
  Sliders,
  AlertTriangle,
  Users,
  Plane,
  FileText,
  LogOut,
  X
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarLink {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const ADMIN_BI_LINKS: SidebarLink[] = [
  { label: 'Executive Overview', path: ROUTES.ADMIN.BI_OVERVIEW, icon: LayoutDashboard },
  { label: 'Mission Profitability', path: ROUTES.ADMIN.BI_PROFITABILITY, icon: TrendingUp },
  { label: 'Scoring Rules Engine', path: ROUTES.ADMIN.BI_RULES_ENGINE, icon: Sliders },
  { label: 'Leakage & Loss Audit', path: ROUTES.ADMIN.BI_LEAKAGE, icon: AlertTriangle },
  { label: 'Operator Efficiency', path: ROUTES.ADMIN.BI_OPERATORS, icon: Users },
  { label: 'Fleet Utilization', path: ROUTES.ADMIN.BI_FLEET, icon: Plane },
  { label: 'Executive Reports', path: ROUTES.ADMIN.BI_REPORTS, icon: FileText },
];

export const Sidebar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  const handleLogout = async () => {
    await logout();
    clearAuth();
    if (typeof window !== 'undefined') window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0D3B2E] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SAF SHIKAN Logo" className="h-10 w-auto object-contain" />
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white">SAF SHIKAN</span>
              <span className="block text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">BI Portal</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-2 px-3 text-xs font-semibold tracking-wider text-emerald-300/60 uppercase">
            Executive Analytics
          </div>
          <nav className="space-y-1">
            {ADMIN_BI_LINKS.map((link) => {
              const IconComponent = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30 font-semibold'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{link.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-sm ring-1 ring-emerald-400/30">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.fullName || 'Executive User'}</p>
                <p className="truncate text-[11px] font-medium text-emerald-400 uppercase tracking-wide">
                  {user?.role || 'ADMIN'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
