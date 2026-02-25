export interface LoanInput {
  propertyValue: number;     // EUR
  downPayment: number;       // EUR
  periodMonths: number;      // months (60-360)
  monthlyIncome?: number;    // EUR net, for eligibility
  existingDebts?: number;    // EUR/month, other loan payments
  userAge?: number;          // years
}

export interface RefinanceInput {
  currentBalance: number;    // EUR - remaining balance
  currentMonthlyPayment: number; // EUR
  remainingMonths: number;   // months left on current loan
  monthlyIncome?: number;
  existingDebts?: number;
  userAge?: number;
}

export interface BankProduct {
  id: string;
  bankName: string;
  productName: string;
  interestType: 'FIXED' | 'VARIABLE' | 'MIXED';
  annualRate: number;          // % per year (for FIXED or MIXED fixed period)
  irccMargin?: number;         // % margin added to IRCC (for VARIABLE)
  irccCurrent?: number;        // current IRCC value (5.86)
  fixedPeriodMonths?: number;  // for MIXED: how many months at fixed rate
  openingCommissionPct: number;   // % of loan amount, paid upfront
  monthlyCommissionPct: number;   // % of loan balance per month
  lifeInsurancePct: number;       // % of outstanding balance per year
  propertyInsuranceAnnual: number; // EUR per year (fixed)
  maxLTV: number;              // % max Loan-To-Value
  maxPeriodMonths: number;     // max loan term in months
  minAmount: number;           // EUR minimum
  maxAmount: number;           // EUR maximum
  bankRating: number;          // 1-10 bank reputation score
  earlyRepaymentPenalty: boolean;
  gracePeriodMonths: number;   // 0 if no grace period
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  adjustedPeriodMonths?: number; // if period was capped due to age
}

export interface MonthlyRow {
  month: number;
  monthlyPayment: number;
  interestPart: number;
  principalPart: number;
  remainingBalance: number;
  totalCostInsurance: number; // life + property insurance for that month
}

export interface VariableScenarios {
  pessimistic: { rate: number; monthlyPayment: number; totalCost: number };
  neutral: { rate: number; monthlyPayment: number; totalCost: number };
  optimistic: { rate: number; monthlyPayment: number; totalCost: number };
}

export interface CalculationResult {
  product: BankProduct;
  loanAmount: number;
  monthlyPayment: number;
  dae: number;                // % annual
  totalCost: number;          // EUR total paid over life
  totalInterest: number;      // EUR interest paid
  totalInsurance: number;     // EUR insurance paid
  openingCost: number;        // EUR upfront fees
  eligibility: EligibilityResult;
  scenarios?: VariableScenarios; // for VARIABLE type only
  recommendationScore: number; // 0-100
  amortizationSchedule: MonthlyRow[];
  savingsVsAverage?: number;  // EUR saved vs market average
}

export interface ScoreWeights {
  totalCost: number;      // default 0.50
  flexibility: number;    // default 0.20
  stability: number;      // default 0.20
  bankReputation: number; // default 0.10
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  totalCost: 0.50,
  flexibility: 0.20,
  stability: 0.20,
  bankReputation: 0.10,
};

export const IRCC_CURRENT = 5.86; // Q4 2024
export const BNR_MAX_DEBT_RATIO = 0.40; // 40%
export const MAX_AGE_AT_LOAN_END = 70;
