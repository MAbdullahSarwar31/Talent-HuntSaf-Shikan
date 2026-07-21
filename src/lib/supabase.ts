import { createClient } from '@supabase/supabase-js';
import config from '../config';
import type { Mission, Drone, Operator, ScoringRule, MaintenanceLog } from '../types';
import { computeMissionProfitabilityScore } from '../utils/scoring';

export const isRealSupabase = Boolean(
  config.supabaseUrl &&
  config.supabaseAnonKey &&
  config.supabaseUrl !== 'your_supabase_url' &&
  config.supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isRealSupabase
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Data Access Layer API
 * Strictly queries live Supabase Postgres database.
 * Re-exported from supabase.ts and biService.ts for native SaaS service layer alignment.
 */
export const dataApi = {
  async getMissions(): Promise<Mission[]> {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase
      .from('missions')
      .select(`
        *,
        drone:drones(*),
        operator:operators(*),
        costs(*),
        profitability_score:profitability_scores(*)
      `)
      .order('date', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((m: any) => {
      if (!m.profitability_score || (!m.profitability_score.score && m.profitability_score.score !== 0)) {
        const scoringRes = computeMissionProfitabilityScore(m, m.costs || []);
        m.profitability_score = {
          mission_id: m.id,
          score: scoringRes.score,
          band: scoringRes.band,
          reasons: scoringRes.reasons,
          recommendations: scoringRes.recommendations
        };
      }
      return m;
    });
  },

  async getMissionById(id: string): Promise<Mission | null> {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase
      .from('missions')
      .select(`
        *,
        drone:drones(*),
        operator:operators(*),
        costs(*),
        profitability_score:profitability_scores(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    if (data) {
      if (!data.profitability_score || (!data.profitability_score.score && data.profitability_score.score !== 0)) {
        const scoringRes = computeMissionProfitabilityScore(data, data.costs || []);
        data.profitability_score = {
          mission_id: data.id,
          score: scoringRes.score,
          band: scoringRes.band,
          reasons: scoringRes.reasons,
          recommendations: scoringRes.recommendations
        };
      }
      return data;
    }
    return null;
  },

  async getDrones(): Promise<Drone[]> {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase.from('drones').select('*').order('serial_number');
    if (error) throw error;
    return data || [];
  },

  async getOperators(): Promise<Operator[]> {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase.from('operators').select('*').order('full_name');
    if (error) throw error;
    return data || [];
  },

  async getScoringRules(): Promise<ScoringRule[]> {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase.from('scoring_rules').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async getMaintenanceLogs(): Promise<MaintenanceLog[]> {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase.from('maintenance_logs').select('*, drone:drones(*)').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};
