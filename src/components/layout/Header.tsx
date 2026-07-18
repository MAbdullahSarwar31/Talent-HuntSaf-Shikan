import React from 'react';
import { isRealSupabase } from '../../lib/supabase';
import { Database } from 'lucide-react';
import clsx from 'clsx';

export const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white border-b border-[#E3ECE7] px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm select-none">
      <div className="flex items-center gap-4">
        {/* Connection Status Badge styled with soft green tones */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#F0F7F4] border border-[#D8E8E0] text-xs font-bold text-[#0B4F36]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Database className={clsx('w-3.5 h-3.5', isRealSupabase ? 'text-emerald-600' : 'text-amber-600')} />
          <span>{isRealSupabase ? 'Supabase Connected (Postgres)' : 'Seeded Intelligence Mode (Zero-Config Demo)'}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* User Profile Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#136C4A] text-white font-black flex items-center justify-center text-xs shadow-sm">
            S
          </div>
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
