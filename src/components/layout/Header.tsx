import React from 'react';
import { isRealSupabase } from '../../lib/supabase';
import { Database, Menu } from 'lucide-react';
import clsx from 'clsx';

interface HeaderProps {
  onOpenMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  return (
    <header className="h-16 md:h-20 bg-white border-b border-[#E3ECE7] px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm select-none">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Hamburger menu button on mobile */}
        <button
          onClick={onOpenMobileNav}
          className="p-2 rounded-xl text-[#0B4F36] bg-[#F0F7F4] border border-[#D8E8E0] hover:bg-[#E3ECE7] transition-colors md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Connection Status Badge styled with soft green tones */}
        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 rounded-full bg-[#F0F7F4] border border-[#D8E8E0] text-xs font-bold text-[#0B4F36]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <Database className={clsx('w-3.5 h-3.5 flex-shrink-0', isRealSupabase ? 'text-emerald-600' : 'text-amber-600')} />
          <span className="hidden sm:inline">
            {isRealSupabase ? 'Supabase Connected (Postgres)' : 'Seeded Intelligence Mode (Zero-Config Demo)'}
          </span>
          <span className="sm:hidden">
            {isRealSupabase ? 'Supabase Live' : 'Seeded Demo'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src="/logo.png"
            alt="SAF SHIKAN"
            className="w-9 h-9 rounded-full bg-white p-0.5 object-contain shadow-sm flex-shrink-0 border border-[#D8E8E0]"
          />
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-[#0B4F36] leading-tight">Saf Shikan Admin</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              ADMIN PORTAL
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
