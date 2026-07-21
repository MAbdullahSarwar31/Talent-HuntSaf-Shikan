import { supabase } from '../../lib/supabase';
import { UserRole } from '../../constants/roles';
import type { AuthUser, LoginRequest, LoginResponse } from '../../types/auth';

/**
 * Resolves authenticated user profile from Supabase profiles table, mapping database strings to UserRole.
 * Conforms strictly to SaaS platform authService.ts profile query behavior.
 */
export async function resolveAuthUser(userId: string, email: string): Promise<AuthUser> {
  if (!supabase || userId === 'demo-admin-id') {
    // Sandbox / Mock local fallback for offline BI demonstration
    return {
      id: userId || 'demo-admin-id',
      email: email || 'executive@safshikan.com',
      fullName: 'Sovereign Executive Demo',
      role: UserRole.ADMIN,
      avatarUrl: null,
      tenantId: 'safshikan-hq',
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Fallback admin role if profile table is not initialized in dedicated BI sandbox schema
      return {
        id: userId,
        email: email,
        fullName: email.split('@')[0] || 'Executive Admin',
        role: UserRole.ADMIN,
        avatarUrl: null,
        tenantId: 'safshikan-hq',
      };
    }

    if (data.is_active === false) {
      throw new Error('Your account has been deactivated by system administrators.');
    }

    let role: UserRole = UserRole.OPERATOR;
    if (data.role === 'manager') role = UserRole.MANAGER;
    if (data.role === 'superadmin' || data.role === 'admin') role = UserRole.ADMIN;

    return {
      id: data.id,
      email: data.email || email,
      fullName: data.full_name || email.split('@')[0],
      role,
      avatarUrl: data.avatar_url || null,
      tenantId: data.tenant_id || 'safshikan-hq',
    };
  } catch (e) {
    console.warn('Profile resolution warning, falling back to ADMIN role:', e);
    return {
      id: userId,
      email: email,
      fullName: email.split('@')[0] || 'Executive Admin',
      role: UserRole.ADMIN,
      avatarUrl: null,
      tenantId: 'safshikan-hq',
    };
  }
}

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const emailClean = req.email.toLowerCase().trim();
  const isDemoCredential =
    emailClean === 'executive@safshikan.com' ||
    emailClean === 'demo@safshikan.com' ||
    (req.password === 'password123' && emailClean.includes('safshikan.com'));

  if (!supabase || isDemoCredential) {
    // Offline sandbox or demo pass-through login
    const user = await resolveAuthUser('demo-admin-id', req.email);
    return {
      accessToken: 'demo-bearer-token-xyz',
      refreshToken: 'demo-refresh-token-xyz',
      user,
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: req.email,
    password: req.password,
  });

  if (error || !data.session || !data.user) {
    throw new Error(error?.message || 'Invalid login credentials.');
  }

  const user = await resolveAuthUser(data.user.id, data.user.email || req.email);

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user,
  };
}

export async function logout(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}
