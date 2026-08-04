'use client';

import { useCurrency } from '@/lib/CurrencyContext';

/**
 * A thin client component used to format and display currency values
 * inside server components that can't call useCurrency() directly.
 */
export function CurrencyValue({ amount, type = 'general' }: { amount: number; type?: 'general' | 'task' }) {
  const { fmt, fmtTask } = useCurrency();
  return <>{type === 'task' ? fmtTask(amount) : fmt(amount)}</>;
}

export function CurrencySymbol() {
  const { symbol } = useCurrency();
  return <>{symbol}</>;
}
