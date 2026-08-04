'use client';

import { useCurrency } from '@/lib/CurrencyContext';

export default function CurrencyDisplay({ amount, isTask = false }: { amount: number, isTask?: boolean }) {
  const { fmt, fmtTask } = useCurrency();
  return <>{isTask ? fmtTask(amount) : fmt(amount)}</>;
}
