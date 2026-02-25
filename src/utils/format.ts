/**
 * Format a number as EUR currency string
 * e.g. 80000 → "80.000 EUR"
 */
export function formatEUR(value: number, decimals = 0): string {
  return (
    value.toLocaleString('ro-RO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + ' EUR'
  );
}

/**
 * Format a percentage
 * e.g. 6.5 → "6,50%"
 */
export function formatPct(value: number, decimals = 2): string {
  return value.toLocaleString('ro-RO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + '%';
}

/**
 * Format months as "X ani [Y luni]"
 */
export function formatPeriod(months: number): string {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} ani`;
  return `${years} ani ${rem} luni`;
}

/**
 * Format a monthly amount with EUR suffix
 */
export function formatMonthly(value: number): string {
  return formatEUR(value, 0) + '/lună';
}

/**
 * Format large number with K/M suffix for compact display
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M EUR`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K EUR`;
  return formatEUR(value);
}

/**
 * Parse a user-typed string to number (handles Romanian comma decimals)
 */
export function parseNumber(str: string): number {
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
