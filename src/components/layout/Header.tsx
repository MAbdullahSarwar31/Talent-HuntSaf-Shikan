import React, { useState } from 'react';
import type { AppRole } from '../../types';
import { isRealSupabase } from '../../lib/supabase';
import { Database, UserCheck, Bell } from 'lucide-react';
import clsx from 'clsx';

export const Header: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<AppRole>('admin');

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
        {/* Role Access Selector for Demo & Verification */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#0B4F36]" />
            Simulated Role:
          </span>
          <div className="inline-flex rounded-xl bg-[#F0F7F4] p-1 border border-[#D8E8E0]">
            {(['admin', 'finance', 'operations'] as AppRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all',
                  currentRole === role
                    ? 'bg-[#0B4F36] text-white shadow-sm'
                    : 'text-[#4A6B5D] hover:text-[#0B4F36]'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Notification bell and User Profile Badge matching screenshot */}
        <div className="flex items-center gap-4 pl-4 border-l border-[#E3ECE7]">
          <div className="relative p-2 rounded-full bg-[#F0F7F4] border border-[#D8E8E0] text-[#0B4F36] cursor-pointer hover:bg-[#E3ECE7] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center border-2 border-white shadow-sm">
              1
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#136C4A] text-white font-black flex items-center justify-center text-xs shadow-sm">
              S
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#0B4F36] leading-tight">Saf Shikan Admin</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {currentRole.toUpperCase()} PORTAL
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
