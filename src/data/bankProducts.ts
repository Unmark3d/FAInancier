import { BankProduct, IRCC_CURRENT } from '../engine/types';

// Current IRCC reference rate (Q4 2024)
const IRCC = IRCC_CURRENT; // 5.86

export const bankProducts: BankProduct[] = [
  // ─────────────────────────────────────────────
  // BCR (Banca Comerciala Romana)
  // ─────────────────────────────────────────────
  {
    id: 'bcr-mixed-5y',
    bankName: 'BCR (Banca Comerciala Romana)',
    productName: 'BCR Fixed 5Y',
    interestType: 'MIXED',
    annualRate: 5.95,
    fixedPeriodMonths: 60,
    openingCommissionPct: 0.5,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.04,
    propertyInsuranceAnnual: 350,
    maxLTV: 85,
    maxPeriodMonths: 360,
    minAmount: 20000,
    maxAmount: 500000,
    bankRating: 9,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 0,
  },
  {
    id: 'bcr-variable',
    bankName: 'BCR (Banca Comerciala Romana)',
    productName: 'BCR Variable',
    interestType: 'VARIABLE',
    annualRate: 2.25 + IRCC, // 8.11
    irccMargin: 2.25,
    irccCurrent: IRCC,
    openingCommissionPct: 0,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.04,
    propertyInsuranceAnnual: 350,
    maxLTV: 85,
    maxPeriodMonths: 360,
    minAmount: 20000,
    maxAmount: 500000,
    bankRating: 9,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 0,
  },

  // ─────────────────────────────────────────────
  // BRD (BRD - Groupe Societe Generale)
  // ─────────────────────────────────────────────
  {
    id: 'brd-fixed',
    bankName: 'BRD - Groupe Societe Generale',
    productName: 'BRD Fixed',
    interestType: 'FIXED',
    annualRate: 6.20,
    openingCommissionPct: 1.0,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.038,
    propertyInsuranceAnnual: 320,
    maxLTV: 80,
    maxPeriodMonths: 360,
    minAmount: 15000,
    maxAmount: 400000,
    bankRating: 8,
    earlyRepaymentPenalty: true,
    gracePeriodMonths: 0,
  },
  {
    id: 'brd-variable',
    bankName: 'BRD - Groupe Societe Generale',
    productName: 'BRD Variable',
    interestType: 'VARIABLE',
    annualRate: 2.45 + IRCC, // 8.31
    irccMargin: 2.45,
    irccCurrent: IRCC,
    openingCommissionPct: 0.5,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.038,
    propertyInsuranceAnnual: 320,
    maxLTV: 80,
    maxPeriodMonths: 360,
    minAmount: 15000,
    maxAmount: 400000,
    bankRating: 8,
    earlyRepaymentPenalty: true,
    gracePeriodMonths: 0,
  },

  // ─────────────────────────────────────────────
  // Banca Transilvania (BT)
  // ─────────────────────────────────────────────
  {
    id: 'bt-prima-casa-fixed',
    bankName: 'Banca Transilvania',
    productName: 'BT Prima Casa Fixed',
    interestType: 'FIXED',
    annualRate: 5.75,
    openingCommissionPct: 0,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.036,
    propertyInsuranceAnnual: 300,
    maxLTV: 90,
    maxPeriodMonths: 360,
    minAmount: 20000,
    maxAmount: 350000,
    bankRating: 9,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 3,
  },
  {
    id: 'bt-variable',
    bankName: 'Banca Transilvania',
    productName: 'BT Variable',
    interestType: 'VARIABLE',
    annualRate: 1.80 + IRCC, // 7.66
    irccMargin: 1.80,
    irccCurrent: IRCC,
    openingCommissionPct: 0,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.036,
    propertyInsuranceAnnual: 300,
    maxLTV: 85,
    maxPeriodMonths: 360,
    minAmount: 20000,
    maxAmount: 350000,
    bankRating: 9,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 3,
  },

  // ─────────────────────────────────────────────
  // ING Bank
  // ─────────────────────────────────────────────
  {
    id: 'ing-fixed',
    bankName: 'ING Bank',
    productName: 'ING Fixed',
    interestType: 'FIXED',
    annualRate: 5.85,
    openingCommissionPct: 0,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.035,
    propertyInsuranceAnnual: 280,
    maxLTV: 85,
    maxPeriodMonths: 300,
    minAmount: 25000,
    maxAmount: 450000,
    bankRating: 9,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 0,
  },
  {
    id: 'ing-variable',
    bankName: 'ING Bank',
    productName: 'ING Variable',
    interestType: 'VARIABLE',
    annualRate: 1.99 + IRCC, // 7.85
    irccMargin: 1.99,
    irccCurrent: IRCC,
    openingCommissionPct: 0,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.035,
    propertyInsuranceAnnual: 280,
    maxLTV: 85,
    maxPeriodMonths: 300,
    minAmount: 25000,
    maxAmount: 450000,
    bankRating: 9,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 0,
  },

  // ─────────────────────────────────────────────
  // Raiffeisen Bank
  // ─────────────────────────────────────────────
  {
    id: 'raiffeisen-fixed',
    bankName: 'Raiffeisen Bank',
    productName: 'Raiffeisen Fixed',
    interestType: 'FIXED',
    annualRate: 6.10,
    openingCommissionPct: 0.75,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.040,
    propertyInsuranceAnnual: 330,
    maxLTV: 80,
    maxPeriodMonths: 360,
    minAmount: 20000,
    maxAmount: 500000,
    bankRating: 8,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 0,
  },
  {
    id: 'raiffeisen-variable',
    bankName: 'Raiffeisen Bank',
    productName: 'Raiffeisen Variable',
    interestType: 'VARIABLE',
    annualRate: 2.10 + IRCC, // 7.96
    irccMargin: 2.10,
    irccCurrent: IRCC,
    openingCommissionPct: 0.5,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.040,
    propertyInsuranceAnnual: 330,
    maxLTV: 80,
    maxPeriodMonths: 360,
    minAmount: 20000,
    maxAmount: 500000,
    bankRating: 8,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 0,
  },

  // ─────────────────────────────────────────────
  // UniCredit Bank
  // ─────────────────────────────────────────────
  {
    id: 'unicredit-fixed',
    bankName: 'UniCredit Bank',
    productName: 'UniCredit Fixed',
    interestType: 'FIXED',
    annualRate: 6.30,
    openingCommissionPct: 1.0,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.042,
    propertyInsuranceAnnual: 360,
    maxLTV: 80,
    maxPeriodMonths: 300,
    minAmount: 20000,
    maxAmount: 400000,
    bankRating: 8,
    earlyRepaymentPenalty: true,
    gracePeriodMonths: 0,
  },
  {
    id: 'unicredit-variable',
    bankName: 'UniCredit Bank',
    productName: 'UniCredit Variable',
    interestType: 'VARIABLE',
    annualRate: 2.30 + IRCC, // 8.16
    irccMargin: 2.30,
    irccCurrent: IRCC,
    openingCommissionPct: 0.75,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.042,
    propertyInsuranceAnnual: 360,
    maxLTV: 80,
    maxPeriodMonths: 300,
    minAmount: 20000,
    maxAmount: 400000,
    bankRating: 8,
    earlyRepaymentPenalty: true,
    gracePeriodMonths: 0,
  },

  // ─────────────────────────────────────────────
  // CEC Bank
  // ─────────────────────────────────────────────
  {
    id: 'cec-fixed',
    bankName: 'CEC Bank',
    productName: 'CEC Fixed',
    interestType: 'FIXED',
    annualRate: 5.70,
    openingCommissionPct: 0.5,
    monthlyCommissionPct: 0.01,
    lifeInsurancePct: 0.038,
    propertyInsuranceAnnual: 290,
    maxLTV: 90,
    maxPeriodMonths: 360,
    minAmount: 15000,
    maxAmount: 300000,
    bankRating: 7,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 6,
  },
  {
    id: 'cec-variable',
    bankName: 'CEC Bank',
    productName: 'CEC Variable',
    interestType: 'VARIABLE',
    annualRate: 1.75 + IRCC, // 7.61
    irccMargin: 1.75,
    irccCurrent: IRCC,
    openingCommissionPct: 0.25,
    monthlyCommissionPct: 0.01,
    lifeInsurancePct: 0.038,
    propertyInsuranceAnnual: 290,
    maxLTV: 90,
    maxPeriodMonths: 360,
    minAmount: 15000,
    maxAmount: 300000,
    bankRating: 7,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 6,
  },

  // ─────────────────────────────────────────────
  // OTP Bank
  // ─────────────────────────────────────────────
  {
    id: 'otp-fixed',
    bankName: 'OTP Bank',
    productName: 'OTP Fixed',
    interestType: 'FIXED',
    annualRate: 6.05,
    openingCommissionPct: 0.8,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.039,
    propertyInsuranceAnnual: 310,
    maxLTV: 80,
    maxPeriodMonths: 300,
    minAmount: 20000,
    maxAmount: 350000,
    bankRating: 7,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 0,
  },
  {
    id: 'otp-variable',
    bankName: 'OTP Bank',
    productName: 'OTP Variable',
    interestType: 'VARIABLE',
    annualRate: 2.20 + IRCC, // 8.06
    irccMargin: 2.20,
    irccCurrent: IRCC,
    openingCommissionPct: 0.5,
    monthlyCommissionPct: 0,
    lifeInsurancePct: 0.039,
    propertyInsuranceAnnual: 310,
    maxLTV: 80,
    maxPeriodMonths: 300,
    minAmount: 20000,
    maxAmount: 350000,
    bankRating: 7,
    earlyRepaymentPenalty: false,
    gracePeriodMonths: 0,
  },
];

export function getBankProducts(): BankProduct[] {
  return bankProducts;
}

export function getBankById(id: string): BankProduct | undefined {
  return bankProducts.find((product) => product.id === id);
}
