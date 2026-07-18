import type { ScoreBand } from './database';

export interface ProfitabilityScoreResult {
  score: number;
  band: ScoreBand;
  netMarginPercentage: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  leakageBreakdown: {
    travelCost: number;
    retryCost: number;
    laborCost: number;
    chemicalCost: number;
    batteryCost: number;
    reserveCost: number;
  };
  reasons: string[];
  recommendations: string[];
}

export interface UtilizationScoreResult {
  score: number;
  band: ScoreBand;
  activeFlightHours: number;
  idleHours: number;
  maintenanceHours: number;
  utilizationPercentage: number;
  reasons: string[];
  recommendations: string[];
}

export interface OperatorScoreResult {
  score: number;
  band: ScoreBand;
  totalMissions: number;
  retryRate: number;
  avgDelayMinutes: number;
  reasons: string[];
  recommendations: string[];
}
