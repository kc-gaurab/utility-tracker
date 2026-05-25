/**
 * Format a number as Euro currency
 */
export function formatEur(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return '€' + n.toFixed(2);
}

/**
 * Format a number as cubic meters
 */
export function formatM3(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return n.toFixed(2) + ' m³';
}

/**
 * Format a number as MWh
 */
export function formatMWh(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return n.toFixed(2) + ' MWh';
}

/**
 * Format a date string (YYYY-MM-DD) to DD.MM.YYYY
 */
export function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

/**
 * Format a number as percentage
 */
export function formatPct(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return (n * 100).toFixed(1) + '%';
}

/**
 * Format a number with specified decimal places
 */
export function formatNum(n: number | null | undefined, dec = 3): string {
  if (n == null || isNaN(n)) return '';
  return n.toFixed(dec);
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
