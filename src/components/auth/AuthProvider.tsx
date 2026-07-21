import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { resolveAuthUser } from '../../services/api/authService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setAuth, clearAuth, setAuthReady } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      // Check if user is already logged in with demo credentials
      const currentToken = useAuthStore.getState().accessToken;
      if (currentToken === 'demo-bearer-token-xyz') {
        if (mounted) setAuthReady(true);
        return;
      }

      if (!supabase) {
        // Offline sandbox demo bootstrap
        if (mounted) {
          const demoUser = await resolveAuthUser('demo-admin-id', 'executive@safshikan.com');
          setAuth(demoUser, 'demo-bearer-token-xyz');
          setAuthReady(true);
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session || !session.user) {
          if (currentToken !== 'demo-bearer-token-xyz') {
            clearAuth();
          }
        } else {
          const profile = await resolveAuthUser(session.user.id, session.user.email || '');
          setAuth(profile, session.access_token);
        }
      } catch (err) {
        console.error('Session bootstrap failure:', err);
        if (currentToken !== 'demo-bearer-token-xyz') {
          clearAuth();
        }
      } finally {
        if (mounted) setAuthReady(true);
      }
    }

    bootstrapAuth();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          const currentToken = useAuthStore.getState().accessToken;
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              const profile = await resolveAuthUser(session.user.id, session.user.email || '');
              setAuth(profile, session.access_token);
            }
          } else if (event === 'SIGNED_OUT') {
            if (currentToken !== 'demo-bearer-token-xyz') {
              clearAuth();
            }
          }
          setAuthReady(true);
        }
      );

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    } else {
      return () => { mounted = false; };
    }
  }, [setAuth, clearAuth, setAuthReady]);

  return <>{children}</>;
};
