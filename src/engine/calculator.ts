import {
  LoanInput,
  RefinanceInput,
  BankProduct,
  EligibilityResult,
  MonthlyRow,
  CalculationResult,
  VariableScenarios,
  ScoreWeights,
  DEFAULT_WEIGHTS,
  IRCC_CURRENT,
  BNR_MAX_DEBT_RATIO,
  MAX_AGE_AT_LOAN_END,
} from './types';

// ---------------------------------------------------------------------------
// calculateMonthlyPayment
// ---------------------------------------------------------------------------
// Standard annuity (French amortization) formula:
//   R = C × [d × (1+d)^n] / [(1+d)^n - 1]
// where d = monthly interest rate (annualRatePct / 12 / 100)
//
// Edge case: annualRatePct === 0 → equal principal instalments (no interest).
// Returns value rounded to 2 decimal places.
// ---------------------------------------------------------------------------
export function calculateMonthlyPayment(
  capital: number,
  annualRatePct: number,
  months: number
): number {
  if (months <= 0) return 0;
  if (annualRatePct === 0) {
    return Math.round((capital / months) * 100) / 100;
  }
  const d = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + d, months);
  const payment = (capital * d * factor) / (factor - 1);
  return Math.round(payment * 100) / 100;
}

// ---------------------------------------------------------------------------
// calculateDAE
// ---------------------------------------------------------------------------
// DAE (Dobânda Anuală Efectivă) is the Romanian equivalent of APR / XIRR.
//
// We solve for the monthly discount rate d that satisfies:
//
//   capital + upfrontCost = Σ_{t=1}^{n}  cashFlows[t-1] / (1 + d)^t
//
// Rearranged into the root-finding form:
//   f(d)  = Σ_{t=1}^{n} CF_t / (1+d)^t  -  (capital + upfrontCost)  = 0
//   f'(d) = Σ_{t=1}^{n} -t × CF_t / (1+d)^(t+1)
//
// Newton-Raphson iteration, max 1000 steps, tolerance 1e-8 on d.
// Initial guess: derived from average cash flow excess.
//
// Returns d_annual = d × 12  as a percentage (× 100), rounded to 4 d.p.
// ---------------------------------------------------------------------------
export function calculateDAE(
  capital: number,
  cashFlows: number[],
  upfrontCost: number
): number {
  const n = cashFlows.length;
  if (n === 0) return 0;

  // Initial guess: a small positive monthly rate
  const totalCF = cashFlows.reduce((a, b) => a + b, 0);
  const excess = totalCF - capital + upfrontCost;
  // Guard against degenerate inputs that would give a non-positive guess
  let d = Math.max(1e-6, excess > 0 ? excess / (capital * n * 12) : 0.005 / 12);

  // Per spec: capital = Σ CF_t/(1+d)^t + upfrontCost
  // → target for the PV sum = capital - upfrontCost
  const target = capital - upfrontCost;

  for (let iter = 0; iter < 1000; iter++) {
    const onePlusD = 1 + d;
    let f = -target;
    let fp = 0;
    let powT = onePlusD; // (1+d)^t, starting at t=1

    for (let t = 0; t < n; t++) {
      const cf = cashFlows[t];
      f += cf / powT;
      fp -= ((t + 1) * cf) / (powT * onePlusD);
      powT *= onePlusD;
    }

    if (Math.abs(fp) < 1e-15) break;

    const delta = f / fp;
    d -= delta;

    // Keep d in a sane positive range
    if (d <= 0) d = 1e-8;

    if (Math.abs(delta) < 1e-8) break;
  }

  // Convert monthly rate → annual percentage, 4 decimal places
  const annualPct = d * 12 * 100;
  return Math.round(annualPct * 10000) / 10000;
}

// ---------------------------------------------------------------------------
// generateAmortizationSchedule
// ---------------------------------------------------------------------------
// Standard French (annuity) amortization table.
//
// Each month t (1..n):
//   balanceBefore    = remainingBalance before this month's payment
//   interestPart     = balanceBefore × (annualRatePct / 12 / 100)
//   principalPart    = monthlyPayment - interestPart
//   remainingBalance = balanceBefore - principalPart  (clamped ≥ 0)
//   lifeInsurance    = balanceBefore × lifeInsurancePct / 100 / 12
//   propertyInsurance= propertyInsuranceAnnual / 12
//   totalCostInsurance = lifeInsurance + propertyInsurance
//
// Last month: principalPart absorbs any remaining balance so that the loan
// closes at exactly zero (corrects accumulated floating-point drift).
// ---------------------------------------------------------------------------
export function generateAmortizationSchedule(
  capital: number,
  annualRatePct: number,
  months: number,
  product: BankProduct
): MonthlyRow[] {
  const schedule: MonthlyRow[] = [];
  const monthlyPayment = calculateMonthlyPayment(capital, annualRatePct, months);
  const d = annualRatePct / 12 / 100;
  let remainingBalance = capital;

  for (let month = 1; month <= months; month++) {
    const balanceBefore = remainingBalance;

    let interestPart: number;
    let principalPart: number;

    if (month === months) {
      // Final month: close off the loan exactly
      interestPart = balanceBefore * d;
      principalPart = balanceBefore; // repay everything left
    } else {
      interestPart = balanceBefore * d;
      principalPart = monthlyPayment - interestPart;
    }

    remainingBalance = Math.max(0, balanceBefore - principalPart);

    // Insurance is computed on the balance at the start of the month (before payment)
    const lifeInsuranceCost = (balanceBefore * product.lifeInsurancePct) / 100 / 12;
    const propertyInsuranceCost = product.propertyInsuranceAnnual / 12;
    const totalCostInsurance = lifeInsuranceCost + propertyInsuranceCost;

    schedule.push({
      month,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      interestPart: Math.round(interestPart * 100) / 100,
      principalPart: Math.round(principalPart * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      totalCostInsurance: Math.round(totalCostInsurance * 100) / 100,
    });
  }

  return schedule;
}

// ---------------------------------------------------------------------------
// checkEligibility
// ---------------------------------------------------------------------------
// Validates whether a borrower qualifies for a bank product according to:
//   1. LTV ratio (new loans only)
//   2. Loan amount min/max
//   3. Borrower age (adjusts period to keep loan ending before age 70)
//   4. BNR debt-to-income cap (40 %)
//
// All messages are written in Romanian.
// ---------------------------------------------------------------------------
export function checkEligibility(
  input: LoanInput | RefinanceInput,
  product: BankProduct,
  loanAmount: number,
  monthlyPayment: number
): EligibilityResult {
  const reasons: string[] = [];
  let isEligible = true;
  let adjustedPeriodMonths: number | undefined;

  const isRefinance = 'currentBalance' in input;
  const periodMonths = isRefinance
    ? (input as RefinanceInput).remainingMonths
    : (input as LoanInput).periodMonths;

  // ---- 1. LTV check (new loans only) ----
  if (!isRefinance) {
    const li = input as LoanInput;
    const ltv = (loanAmount / li.propertyValue) * 100;
    if (ltv > product.maxLTV) {
      isEligible = false;
      const minDownPayment = Math.ceil(li.propertyValue * (1 - product.maxLTV / 100));
      reasons.push(
        `LTV ${ltv.toFixed(1)}% depășește limita băncii de ${product.maxLTV}%. ` +
          `Avans minim necesar: ${minDownPayment} EUR.`
      );
    }
  }

  // ---- 2. Loan amount min/max ----
  if (loanAmount < product.minAmount) {
    isEligible = false;
    reasons.push(
      `Suma împrumutată (${loanAmount.toFixed(0)} EUR) este sub minimul băncii ` +
        `(${product.minAmount} EUR).`
    );
  }
  if (loanAmount > product.maxAmount) {
    isEligible = false;
    reasons.push(
      `Suma împrumutată (${loanAmount.toFixed(0)} EUR) depășește maximul băncii ` +
        `(${product.maxAmount} EUR).`
    );
  }

  // ---- 3. Age check ----
  if (input.userAge !== undefined) {
    const maxAllowedMonths = (MAX_AGE_AT_LOAN_END - input.userAge) * 12;
    const cappedPeriod = Math.min(product.maxPeriodMonths, maxAllowedMonths);

    if (cappedPeriod <= 0) {
      isEligible = false;
      reasons.push(
        `Vârsta (${input.userAge} ani) depășește limita maximă de ` +
          `${MAX_AGE_AT_LOAN_END} ani la finalul creditului.`
      );
    } else if (cappedPeriod < periodMonths) {
      adjustedPeriodMonths = cappedPeriod;
      reasons.push(
        `Perioada a fost ajustată la ${cappedPeriod} luni pentru ca vârsta la finalul ` +
          `creditului să nu depășească ${MAX_AGE_AT_LOAN_END} ani.`
      );
    }
  }

  // ---- 4. BNR debt-to-income ratio (40 %) ----
  if (input.monthlyIncome !== undefined && input.monthlyIncome > 0) {
    const existingDebts = input.existingDebts ?? 0;
    const totalDebt = monthlyPayment + existingDebts;
    const ratio = totalDebt / input.monthlyIncome;
    if (ratio > BNR_MAX_DEBT_RATIO) {
      isEligible = false;
      reasons.push(
        `Rata lunară totală (${totalDebt.toFixed(0)} EUR) reprezintă ` +
          `${(ratio * 100).toFixed(1)}% din venit, depășind limita BNR de ` +
          `${(BNR_MAX_DEBT_RATIO * 100).toFixed(0)}%.`
      );
    }
  }

  return {
    isEligible,
    reasons,
    ...(adjustedPeriodMonths !== undefined ? { adjustedPeriodMonths } : {}),
  };
}

// ---------------------------------------------------------------------------
// calculateRecommendationScore
// ---------------------------------------------------------------------------
// Composite 0-100 score weighted across four dimensions:
//
//   totalCostScore   = 1 – (thisCost – minCost) / (maxCost – minCost)
//                      (1 = cheapest, 0 = most expensive)
//   flexScore        = 0.5 × (no early-repayment penalty) + 0.5 × (grace period > 0)
//   stabScore        = FIXED → 1.0 | MIXED → 0.6 | VARIABLE → 0.2
//   repScore         = bankRating / 10
//
//   score = 100 × (w_cost × totalCostScore + w_flex × flexScore +
//                  w_stab × stabScore + w_rep × repScore)
// ---------------------------------------------------------------------------
export function calculateRecommendationScore(
  result: Omit<CalculationResult, 'recommendationScore'>,
  allResults: Omit<CalculationResult, 'recommendationScore'>[],
  weights: ScoreWeights
): number {
  // --- Total cost score (normalized, lower cost = higher score) ---
  let totalCostScore: number;
  if (allResults.length <= 1) {
    totalCostScore = 1;
  } else {
    const costs = allResults.map((r) => r.totalCost);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    if (maxCost === minCost) {
      totalCostScore = 1;
    } else {
      totalCostScore = 1 - (result.totalCost - minCost) / (maxCost - minCost);
    }
  }

  // --- Flexibility score ---
  const flexScore =
    (result.product.earlyRepaymentPenalty ? 0 : 0.5) +
    (result.product.gracePeriodMonths > 0 ? 0.5 : 0);

  // --- Stability score ---
  const stabMap: Record<BankProduct['interestType'], number> = {
    FIXED: 1.0,
    MIXED: 0.6,
    VARIABLE: 0.2,
  };
  const stabScore = stabMap[result.product.interestType];

  // --- Bank reputation score ---
  const repScore = result.product.bankRating / 10;

  // --- Weighted composite → 0-100 ---
  const composite =
    weights.totalCost * totalCostScore +
    weights.flexibility * flexScore +
    weights.stability * stabScore +
    weights.bankReputation * repScore;

  return Math.round(composite * 100 * 100) / 100; // 2 decimal places
}

// ===========================================================================
// Private helpers
// ===========================================================================

/**
 * Build per-month cash-flow array used for DAE calculation and totals.
 *
 * Monthly outflow for period t:
 *   annuity payment
 *   + monthly commission  (balanceBefore × monthlyCommissionPct / 100)
 *   + life insurance      (balanceBefore × lifeInsurancePct / 100 / 12)
 *   + property insurance  (propertyInsuranceAnnual / 12)
 *
 * Also accumulates totalInterest, totalInsurance, totalCommissions.
 */
function buildCashFlows(
  capital: number,
  annualRatePct: number,
  months: number,
  product: BankProduct
): {
  cashFlows: number[];
  totalInterest: number;
  totalInsurance: number;
  totalCommissions: number;
} {
  const schedule = generateAmortizationSchedule(capital, annualRatePct, months, product);
  const cashFlows: number[] = [];
  let totalInterest = 0;
  let totalInsurance = 0;
  let totalCommissions = 0;

  for (const row of schedule) {
    // Balance before this month's payment = remainingBalance + principalPart
    const balanceBefore = row.remainingBalance + row.principalPart;
    const monthlyComm = (balanceBefore * product.monthlyCommissionPct) / 100;
    const totalMonthly = row.monthlyPayment + monthlyComm + row.totalCostInsurance;

    cashFlows.push(totalMonthly);
    totalInterest += row.interestPart;
    totalInsurance += row.totalCostInsurance;
    totalCommissions += monthlyComm;
  }

  return { cashFlows, totalInterest, totalInsurance, totalCommissions };
}

/**
 * Derive the effective annual rate for a product.
 *   FIXED    → product.annualRate
 *   MIXED    → product.annualRate (fixed-period rate; variable phase not separately modelled)
 *   VARIABLE → (irccCurrent ?? IRCC_CURRENT) + irccMargin
 */
function effectiveRate(product: BankProduct): number {
  if (product.interestType === 'VARIABLE') {
    const ircc = product.irccCurrent ?? IRCC_CURRENT;
    const margin = product.irccMargin ?? 0;
    return Math.max(0, ircc + margin);
  }
  return product.annualRate;
}

/**
 * Compute variable-rate scenarios for a VARIABLE product.
 *   pessimistic → IRCC + 2 pp
 *   neutral     → IRCC (current)
 *   optimistic  → IRCC − 2 pp (floored at 0)
 */
function computeVariableScenarios(
  capital: number,
  months: number,
  product: BankProduct
): VariableScenarios {
  const ircc = product.irccCurrent ?? IRCC_CURRENT;
  const margin = product.irccMargin ?? 0;
  const openingCost = (capital * product.openingCommissionPct) / 100;

  const deltas: Array<['pessimistic' | 'neutral' | 'optimistic', number]> = [
    ['pessimistic', 2],
    ['neutral', 0],
    ['optimistic', -2],
  ];

  const out: Partial<VariableScenarios> = {};

  for (const [label, delta] of deltas) {
    const rate = Math.max(0, ircc + margin + delta);
    const mp = calculateMonthlyPayment(capital, rate, months);
    const { totalInsurance, totalCommissions } = buildCashFlows(capital, rate, months, product);
    const totalCost = mp * months + totalInsurance + totalCommissions + openingCost;

    out[label] = { rate, monthlyPayment: mp, totalCost };
  }

  return out as VariableScenarios;
}

/**
 * Core calculation routine shared by all three scenarios.
 * Returns a CalculationResult without recommendationScore / savingsVsAverage
 * (those are filled in by the calling scenario function).
 */
function computeResult(
  product: BankProduct,
  loanAmount: number,
  annualRatePct: number,
  months: number,
  input: LoanInput | RefinanceInput
): Omit<CalculationResult, 'recommendationScore' | 'savingsVsAverage'> {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualRatePct, months);
  const openingCost = (loanAmount * product.openingCommissionPct) / 100;

  const { cashFlows, totalInterest, totalInsurance, totalCommissions } = buildCashFlows(
    loanAmount,
    annualRatePct,
    months,
    product
  );

  const dae = calculateDAE(loanAmount, cashFlows, openingCost);

  // Total cost = sum of all annuity payments + all commissions + all insurance + upfront fee
  const totalCost = monthlyPayment * months + totalCommissions + totalInsurance + openingCost;

  const eligibility = checkEligibility(input, product, loanAmount, monthlyPayment);

  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount,
    annualRatePct,
    months,
    product
  );

  const base: Omit<CalculationResult, 'recommendationScore' | 'savingsVsAverage'> = {
    product,
    loanAmount,
    monthlyPayment,
    dae,
    totalCost,
    totalInterest,
    totalInsurance,
    openingCost,
    eligibility,
    amortizationSchedule,
  };

  if (product.interestType === 'VARIABLE') {
    base.scenarios = computeVariableScenarios(loanAmount, months, product);
  }

  return base;
}

// ===========================================================================
// Exported scenario runners
// ===========================================================================

// ---------------------------------------------------------------------------
// runScenarioA – "I know how much I want to borrow"
// ---------------------------------------------------------------------------
// loanAmount = propertyValue - downPayment
// All eligible products are computed; results sorted by recommendationScore DESC.
// savingsVsAverage is the difference from the average totalCost of eligible products.
// ---------------------------------------------------------------------------
export function runScenarioA(
  input: LoanInput,
  products: BankProduct[],
  weights: ScoreWeights = DEFAULT_WEIGHTS
): CalculationResult[] {
  const loanAmount = input.propertyValue - input.downPayment;

  // First pass: raw computation for all products
  const rawResults: Omit<CalculationResult, 'recommendationScore' | 'savingsVsAverage'>[] = [];

  for (const product of products) {
    const rate = effectiveRate(product);
    const months = Math.min(input.periodMonths, product.maxPeriodMonths);
    rawResults.push(computeResult(product, loanAmount, rate, months, input));
  }

  // Market average total cost (eligible products only)
  const eligibleRaws = rawResults.filter((r) => r.eligibility.isEligible);
  const avgTotalCost =
    eligibleRaws.length > 0
      ? eligibleRaws.reduce((sum, r) => sum + r.totalCost, 0) / eligibleRaws.length
      : 0;

  // Second pass: attach scores and savings
  const results: CalculationResult[] = rawResults.map((raw) => {
    const recommendationScore = calculateRecommendationScore(raw, rawResults, weights);
    const savingsVsAverage = avgTotalCost > 0 ? avgTotalCost - raw.totalCost : undefined;

    return {
      ...raw,
      recommendationScore,
      ...(savingsVsAverage !== undefined ? { savingsVsAverage } : {}),
    };
  });

  return results.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

// ---------------------------------------------------------------------------
// runScenarioB – "I know how much I can pay monthly"
// ---------------------------------------------------------------------------
// For each product the maximum feasible loan is found using:
//   1. Algebraic inversion of the annuity formula to get an upper bound capital.
//   2. Binary search (60 iterations) that accounts for commissions and insurance
//      so that the TOTAL first-month outflow stays ≤ maxMonthlyPayment.
// Products yielding < max(10 000, minAmount) EUR are skipped.
// ---------------------------------------------------------------------------
export function runScenarioB(
  maxMonthlyPayment: number,
  periodMonths: number,
  products: BankProduct[],
  monthlyIncome?: number,
  existingDebts?: number,
  userAge?: number,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): CalculationResult[] {
  const MIN_USEFUL_LOAN = 10_000; // EUR

  // Synthetic LoanInput for eligibility checks.
  // We use a very large propertyValue so the LTV check does not block anything here —
  // the bank's maxLTV / maxAmount will be the binding constraint instead.
  function makeSyntheticInput(capital: number): LoanInput {
    return {
      propertyValue: capital * 1000,
      downPayment: 0,
      periodMonths,
      monthlyIncome,
      existingDebts,
      userAge,
    };
  }

  const rawResults: Omit<CalculationResult, 'recommendationScore' | 'savingsVsAverage'>[] = [];

  for (const product of products) {
    const rate = effectiveRate(product);
    const months = Math.min(periodMonths, product.maxPeriodMonths);

    // Step 1 – algebraic upper bound: pure annuity inverse
    let capitalMax: number;
    if (rate === 0) {
      capitalMax = maxMonthlyPayment * months;
    } else {
      const d = rate / 12 / 100;
      const factor = Math.pow(1 + d, months);
      capitalMax = (maxMonthlyPayment * (factor - 1)) / (d * factor);
    }
    // Respect product maximum
    capitalMax = Math.min(capitalMax, product.maxAmount);

    // Step 2 – binary search accounting for extras (commission + insurance)
    // We use the first-month outflow as a proxy (conservative: balance decreases over time,
    // so first month has the highest commission/insurance burden).
    let lo = 0;
    let hi = capitalMax;
    let feasibleCapital = 0;

    for (let iter = 0; iter < 60; iter++) {
      const mid = (lo + hi) / 2;
      if (mid < 1) break;

      const mp = calculateMonthlyPayment(mid, rate, months);
      // First-month extras (balance ≈ mid at start)
      const monthlyComm = (mid * product.monthlyCommissionPct) / 100;
      const lifeIns = (mid * product.lifeInsurancePct) / 100 / 12;
      const propIns = product.propertyInsuranceAnnual / 12;
      const totalFirstMonth = mp + monthlyComm + lifeIns + propIns;

      if (totalFirstMonth <= maxMonthlyPayment) {
        feasibleCapital = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    // Truncate to whole euros (conservative)
    feasibleCapital = Math.floor(feasibleCapital);

    if (feasibleCapital < Math.max(MIN_USEFUL_LOAN, product.minAmount)) {
      continue;
    }

    const syntheticInput = makeSyntheticInput(feasibleCapital);
    rawResults.push(computeResult(product, feasibleCapital, rate, months, syntheticInput));
  }

  if (rawResults.length === 0) return [];

  const results: CalculationResult[] = rawResults.map((raw) => ({
    ...raw,
    recommendationScore: calculateRecommendationScore(raw, rawResults, weights),
  }));

  return results.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

// ---------------------------------------------------------------------------
// runScenarioC – "I want to refinance"
// ---------------------------------------------------------------------------
// Refinances currentBalance over the same remainingMonths with each product.
// monthlySavings = currentMonthlyPayment - newMonthlyPayment
// totalSavings   = (currentMonthlyPayment × remainingMonths) - newTotalCost
// Sorted by recommendationScore DESC.
// ---------------------------------------------------------------------------
export function runScenarioC(
  input: RefinanceInput,
  products: BankProduct[],
  weights: ScoreWeights = DEFAULT_WEIGHTS
): (CalculationResult & { monthlySavings: number; totalSavings: number })[] {
  const loanAmount = input.currentBalance;
  const currentRemainingCost = input.currentMonthlyPayment * input.remainingMonths;

  const rawResults: Omit<CalculationResult, 'recommendationScore' | 'savingsVsAverage'>[] = [];

  for (const product of products) {
    const rate = effectiveRate(product);
    const months = Math.min(input.remainingMonths, product.maxPeriodMonths);
    rawResults.push(computeResult(product, loanAmount, rate, months, input));
  }

  const results: (CalculationResult & { monthlySavings: number; totalSavings: number })[] =
    rawResults.map((raw) => {
      const recommendationScore = calculateRecommendationScore(raw, rawResults, weights);
      const monthlySavings = input.currentMonthlyPayment - raw.monthlyPayment;
      const totalSavings = currentRemainingCost - raw.totalCost;

      return {
        ...raw,
        recommendationScore,
        monthlySavings,
        totalSavings,
      };
    });

  return results.sort((a, b) => b.recommendationScore - a.recommendationScore);
}
