import React from 'react';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Menu, Building2 } from 'lucide-react';

export const Topbar: React.FC = () => {
  const { toggleSidebar } = useUiStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/95 px-6 backdrop-blur-md shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <Building2 className="h-5 w-5 text-[#0D3B2E]" />
          <span className="font-display text-sm font-bold text-gray-900 tracking-tight">
            SAF SHIKAN Agro Portal
          </span>
          <span className="hidden sm:inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-[#0D3B2E] border border-emerald-200">
            BI Analytics Engine
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Telemetry & BI Synchronized</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-900">{user?.fullName || 'Sovereign Admin'}</p>
            <p className="text-[10px] font-medium text-gray-500 uppercase">{user?.tenantId || 'safshikan-hq'}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D3B2E] text-white font-bold text-xs shadow-sm ring-2 ring-emerald-500/20">
            {user?.fullName?.charAt(0) || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};
