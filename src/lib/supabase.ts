import { createClient } from '@supabase/supabase-js';
import type { Mission, Drone, Operator, ScoringRule, MaintenanceLog } from '../types';
import { mockMissions, mockDrones, mockOperators, mockScoringRules, mockMaintenanceLogs } from '../utils/mockData';
import { computeMissionProfitabilityScore } from '../utils/scoring';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isRealSupabase = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url');

export const supabase = isRealSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Data Access Layer API
 * Transparently fetches from real Supabase Postgres or returns seeded client dataset.
 */
export const dataApi = {
  async getMissions(): Promise<Mission[]> {
    if (isRealSupabase && supabase) {
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
      if (data && data.length > 0) {
        // Ensure scores are attached or compute on the fly if missing
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
      }
    }
    // Simulate slight network latency for realistic UX demo
    await new Promise(r => setTimeout(r, 250));
    return mockMissions;
  },

  async getMissionById(id: string): Promise<Mission | null> {
    if (isRealSupabase && supabase) {
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
    }
    await new Promise(r => setTimeout(r, 200));
    return mockMissions.find(m => m.id === id) || null;
  },

  async getDrones(): Promise<Drone[]> {
    if (isRealSupabase && supabase) {
      const { data, error } = await supabase.from('drones').select('*').order('serial_number');
      if (error) throw error;
      if (data && data.length > 0) return data;
    }
    await new Promise(r => setTimeout(r, 200));
    return mockDrones;
  },

  async getOperators(): Promise<Operator[]> {
    if (isRealSupabase && supabase) {
      const { data, error } = await supabase.from('operators').select('*').order('full_name');
      if (error) throw error;
      if (data && data.length > 0) return data;
    }
    await new Promise(r => setTimeout(r, 200));
    return mockOperators;
  },

  async getScoringRules(): Promise<ScoringRule[]> {
    if (isRealSupabase && supabase) {
      const { data, error } = await supabase.from('scoring_rules').select('*').order('name');
      if (error) throw error;
      if (data && data.length > 0) return data;
    }
    await new Promise(r => setTimeout(r, 150));
    return mockScoringRules;
  },

  async getMaintenanceLogs(): Promise<MaintenanceLog[]> {
    if (isRealSupabase && supabase) {
      const { data, error } = await supabase.from('maintenance_logs').select('*, drone:drones(*)').order('date', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data;
    }
    await new Promise(r => setTimeout(r, 150));
    return mockMaintenanceLogs;
  }
};
