import { create } from 'zustand';
import { LoanInput, RefinanceInput, CalculationResult, ScoreWeights, DEFAULT_WEIGHTS } from '../engine/types';

export type ActiveScenario = 'A' | 'B' | 'C' | null;

interface AppState {
  // Active scenario
  activeScenario: ActiveScenario;
  setActiveScenario: (s: ActiveScenario) => void;

  // Scenario A input
  scenarioAInput: Partial<LoanInput>;
  setScenarioAInput: (input: Partial<LoanInput>) => void;

  // Scenario B input
  scenarioBMaxPayment: number;
  scenarioBPeriod: number;
  scenarioBIncome?: number;
  scenarioBDebts?: number;
  scenarioBAge?: number;
  setScenarioBInput: (data: {
    maxPayment?: number;
    period?: number;
    income?: number;
    debts?: number;
    age?: number;
  }) => void;

  // Scenario C input
  scenarioCInput: Partial<RefinanceInput>;
  setScenarioCInput: (input: Partial<RefinanceInput>) => void;

  // Results
  results: CalculationResult[];
  setResults: (results: CalculationResult[]) => void;

  // Selected result for detail view
  selectedResultId: string | null;
  setSelectedResultId: (id: string | null) => void;

  // Score weights
  weights: ScoreWeights;
  setWeights: (weights: ScoreWeights) => void;
  resetWeights: () => void;

  // Reset all
  resetAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeScenario: null,
  setActiveScenario: (s) => set({ activeScenario: s }),

  scenarioAInput: {
    propertyValue: 100_000,
    downPayment: 20_000,
    periodMonths: 300,
  },
  setScenarioAInput: (input) =>
    set((state) => ({ scenarioAInput: { ...state.scenarioAInput, ...input } })),

  scenarioBMaxPayment: 500,
  scenarioBPeriod: 300,
  setScenarioBInput: (data) =>
    set((state) => ({
      scenarioBMaxPayment: data.maxPayment ?? state.scenarioBMaxPayment,
      scenarioBPeriod: data.period ?? state.scenarioBPeriod,
      scenarioBIncome: data.income ?? state.scenarioBIncome,
      scenarioBDebts: data.debts ?? state.scenarioBDebts,
      scenarioBAge: data.age ?? state.scenarioBAge,
    })),

  scenarioCInput: {
    currentBalance: 80_000,
    currentMonthlyPayment: 550,
    remainingMonths: 240,
  },
  setScenarioCInput: (input) =>
    set((state) => ({ scenarioCInput: { ...state.scenarioCInput, ...input } })),

  results: [],
  setResults: (results) => set({ results }),

  selectedResultId: null,
  setSelectedResultId: (id) => set({ selectedResultId: id }),

  weights: { ...DEFAULT_WEIGHTS },
  setWeights: (weights) => set({ weights }),
  resetWeights: () => set({ weights: { ...DEFAULT_WEIGHTS } }),

  resetAll: () =>
    set({
      activeScenario: null,
      results: [],
      selectedResultId: null,
      scenarioAInput: { propertyValue: 100_000, downPayment: 20_000, periodMonths: 300 },
      scenarioBMaxPayment: 500,
      scenarioBPeriod: 300,
      scenarioBIncome: undefined,
      scenarioBDebts: undefined,
      scenarioBAge: undefined,
      scenarioCInput: { currentBalance: 80_000, currentMonthlyPayment: 550, remainingMonths: 240 },
      weights: { ...DEFAULT_WEIGHTS },
    }),
}));
