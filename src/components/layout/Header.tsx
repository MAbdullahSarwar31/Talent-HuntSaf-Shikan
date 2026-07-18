import React, { useState } from 'react';
import type { AppRole } from '../../types';
import { isRealSupabase } from '../../lib/supabase';
import { Database, UserCheck } from 'lucide-react';
import clsx from 'clsx';

export const Header: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<AppRole>('admin');

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Connection Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Database className={clsx('w-3.5 h-3.5', isRealSupabase ? 'text-emerald-600' : 'text-amber-600')} />
          <span>{isRealSupabase ? 'Supabase Connected (Postgres)' : 'Seeded Intelligence Mode (Zero-Config Demo)'}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Role Access Selector for Demo & Verification */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Simulated Role:
          </span>
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            {(['admin', 'finance', 'operations'] as AppRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-bold uppercase transition-all',
                  currentRole === role
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
            AS
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-800">Abdullah Sarwar</div>
            <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
              {currentRole} Access
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
