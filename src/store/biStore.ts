import { create } from 'zustand';
import type { ScoringRule } from '../types';

export interface BiSimulationState {
  sandboxRules: ScoringRule[];
  fuelCostMultiplier: number;
  maintenanceReservePercent: number;
  pilotBonusThreshold: number;
  setSandboxRules: (rules: ScoringRule[]) => void;
  updateRuleWeight: (ruleId: string, weight: number) => void;
  setSimulationParams: (params: Partial<{
    fuelCostMultiplier: number;
    maintenanceReservePercent: number;
    pilotBonusThreshold: number;
  }>) => void;
  resetToDefaults: () => void;
}

export const useBiStore = create<BiSimulationState>((set) => ({
  sandboxRules: [],
  fuelCostMultiplier: 1.0,
  maintenanceReservePercent: 15.0,
  pilotBonusThreshold: 85.0,

  setSandboxRules: (rules) => set({ sandboxRules: rules }),

  updateRuleWeight: (ruleId, weight) =>
    set((state) => ({
      sandboxRules: state.sandboxRules.map((r) =>
        r.id === ruleId ? { ...r, weight } : r
      ),
    })),

  setSimulationParams: (params) =>
    set((state) => ({ ...state, ...params })),

  resetToDefaults: () =>
    set({
      fuelCostMultiplier: 1.0,
      maintenanceReservePercent: 15.0,
      pilotBonusThreshold: 85.0,
    }),
}));
