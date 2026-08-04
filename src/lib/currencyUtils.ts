/**
 * Currency & Task Earnings Mode Utilities
 * 
 * These helpers read the platform settings (affiliateCurrency, usdExchangeRate,
 * taskEarningsMode, pointsConversionRate) and format monetary values accordingly.
 */

export interface CurrencySettings {
  affiliateCurrency: string;  // "NGN" | "USD"
  usdExchangeRate: number;    // e.g. 1600
  taskEarningsMode: string;   // "CASH" | "POINTS"
  pointsConversionRate: number; // e.g. 1.0
}

const DEFAULT_SETTINGS: CurrencySettings = {
  affiliateCurrency: 'NGN',
  usdExchangeRate: 1600,
  taskEarningsMode: 'CASH',
  pointsConversionRate: 1,
};

/**
 * Format a monetary amount based on the affiliate currency setting.
 * If currency is USD, divides the NGN value by the exchange rate.
 */
export function formatCurrency(amount: number, settings?: CurrencySettings | null): string {
  const s = settings || DEFAULT_SETTINGS;
  if (s.affiliateCurrency === 'USD') {
    const usdAmount = amount / (s.usdExchangeRate || 1600);
    return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Format task earnings — as cash or points.
 */
export function formatTaskEarnings(amount: number, settings?: CurrencySettings | null): string {
  const s = settings || DEFAULT_SETTINGS;
  if (s.taskEarningsMode === 'POINTS') {
    const points = amount * (s.pointsConversionRate || 1);
    return `${points.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Points`;
  }
  // In cash mode, use the active currency
  return formatCurrency(amount, s);
}

/**
 * Get just the currency symbol.
 */
export function getCurrencySymbol(settings?: CurrencySettings | null): string {
  const s = settings || DEFAULT_SETTINGS;
  return s.affiliateCurrency === 'USD' ? '$' : '₦';
}

/**
 * Get the task unit label.
 */
export function getTaskLabel(settings?: CurrencySettings | null): string {
  const s = settings || DEFAULT_SETTINGS;
  return s.taskEarningsMode === 'POINTS' ? 'Points' : getCurrencySymbol(s);
}

/**
 * Convert a raw NGN amount to the display value (without symbol).
 */
export function convertAmount(amount: number, settings?: CurrencySettings | null): number {
  const s = settings || DEFAULT_SETTINGS;
  if (s.affiliateCurrency === 'USD') {
    return parseFloat((amount / (s.usdExchangeRate || 1600)).toFixed(2));
  }
  return amount;
}
