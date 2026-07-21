/**
 * Typed environment-variable reader conforming to SaaS platform config pattern.
 * All components and services read configuration from here — never import.meta.env directly.
 */

function readEnv(key: string, fallback?: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value && !fallback) {
    console.warn(`Missing required environment variable: ${key}`);
    return '';
  }
  return value ?? fallback ?? '';
}

const config = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL', 'https://api.agron.safshikan.com/api'),
  appEnv: (import.meta.env['VITE_APP_ENV'] ?? 'development') as
    | 'development'
    | 'staging'
    | 'production',
  supabaseUrl: readEnv('NEXT_PUBLIC_SUPABASE_URL', import.meta.env['VITE_SUPABASE_URL'] || 'https://your-project.supabase.co'),
  supabaseAnonKey: readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', import.meta.env['VITE_SUPABASE_ANON_KEY'] || 'your-anon-key'),
} as const;

export default config;
