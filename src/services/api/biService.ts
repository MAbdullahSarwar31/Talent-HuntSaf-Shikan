import { dataApi } from '../../lib/supabase';
import type { Mission, Drone, Operator, ScoringRule, MaintenanceLog } from '../../types';

/**
 * BI Service API
 * Conforms to SaaS platform service-layer architecture (e.g. adminService.ts).
 * Encapsulates all data access, RPC calls, and Supabase table queries for Mission Profitability & Scoring.
 */
export const biService = {
  getMissions: (): Promise<Mission[]> => dataApi.getMissions(),
  getMissionById: (id: string): Promise<Mission | null> => dataApi.getMissionById(id),
  getDrones: (): Promise<Drone[]> => dataApi.getDrones(),
  getOperators: (): Promise<Operator[]> => dataApi.getOperators(),
  getScoringRules: (): Promise<ScoringRule[]> => dataApi.getScoringRules(),
  getMaintenanceLogs: (): Promise<MaintenanceLog[]> => dataApi.getMaintenanceLogs(),
};

export default biService;
