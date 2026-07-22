import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/api/authService';
import { useAuthStore } from '../../store/authStore';
import { ROLE_DEFAULT_ROUTES } from '../../constants/roles';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login({ email, password });
      setAuth(res.user, res.accessToken);

      const from = (location.state as any)?.from?.pathname;
      const destination = from && from !== '/login'
        ? from
        : (ROLE_DEFAULT_ROUTES[res.user.role] || '/admin/bi/overview');

      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-sans">
      {/* Left Branding Split */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-[#0D3B2E] via-[#0D3B2E] to-black p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10">
          <img src="/logo.png" alt="SAF SHIKAN Logo" className="h-11 w-auto object-contain" />
          <div>
            <span className="font-display text-xl font-bold tracking-tight">SAF SHIKAN</span>
            <span className="block text-xs font-semibold tracking-wider text-emerald-400 uppercase">Mission Profitability BI</span>
          </div>
        </div>

        <div className="max-w-md relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
            <ShieldCheck className="h-4 w-4" />
            <span>Sovereign SaaS Security</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight leading-tight">
            Precision Intelligence for Agricultural Fleet Command
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Integrated Executive Analytics, Mission Profitability Scoring Engine, and Fleet Telemetry synchronized across the SAF SHIKAN platform.
          </p>
        </div>

        <div className="text-xs text-gray-400 flex items-center justify-between relative z-10 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} SAF SHIKAN Agro Portal. All rights reserved.</span>
          <span className="text-emerald-400 font-semibold">v2.4 Enterprise</span>
        </div>
      </div>

      {/* Right Login Form Split */}
      <div className="flex flex-1 items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
              <img src="/logo.png" alt="SAF SHIKAN Logo" className="h-10 w-auto object-contain" />
              <span className="font-display text-xl font-bold text-gray-900">SAF SHIKAN BI</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Executive Portal Sign In
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter authorized administrator or executive manager credentials.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Executive Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-2xs focus:border-[#0D3B2E] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]/20 transition-all"
                  placeholder="executive@safshikan.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-2xs focus:border-[#0D3B2E] focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]/20 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D3B2E] py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#081f18] focus:outline-none focus:ring-4 focus:ring-[#0D3B2E]/20 disabled:opacity-70 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Executive BI</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
