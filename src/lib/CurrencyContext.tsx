'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { CurrencySettings } from '@/lib/currencyUtils';
import { formatCurrency, formatTaskEarnings, getCurrencySymbol, getTaskLabel, convertAmount } from '@/lib/currencyUtils';

interface CurrencyContextValue {
  settings: CurrencySettings;
  loading: boolean;
  /** Format any monetary amount using the active affiliate currency */
  fmt: (amount: number) => string;
  /** Format task earnings (cash or points) */
  fmtTask: (amount: number) => string;
  /** Get just the currency symbol (₦ or $) */
  symbol: string;
  /** Get the task unit label */
  taskLabel: string;
  /** Convert raw NGN amount to display value */
  convert: (amount: number) => number;
}

const defaultSettings: CurrencySettings = {
  affiliateCurrency: 'NGN',
  usdExchangeRate: 1600,
  taskEarningsMode: 'CASH',
  pointsConversionRate: 1,
};

const CurrencyContext = createContext<CurrencyContextValue>({
  settings: defaultSettings,
  loading: true,
  fmt: (n) => `₦${n.toLocaleString()}`,
  fmtTask: (n) => `₦${n.toLocaleString()}`,
  symbol: '₦',
  taskLabel: '₦',
  convert: (n) => n,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CurrencySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/settings/currency?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(async (data) => {
        if (data && data.affiliateCurrency) {
          // If currency is USD, also fetch live exchange rate
          if (data.affiliateCurrency === 'USD') {
            try {
              const rateRes = await fetch('/api/settings/exchange-rate');
              const rateData = await rateRes.json();
              if (rateData.rate) {
                data.usdExchangeRate = rateData.rate;
              }
            } catch {
              // Keep the saved rate if live fetch fails
            }
          }
          setSettings(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const value: CurrencyContextValue = {
    settings,
    loading,
    fmt: (amount: number) => formatCurrency(amount, settings),
    fmtTask: (amount: number) => formatTaskEarnings(amount, settings),
    symbol: getCurrencySymbol(settings),
    taskLabel: getTaskLabel(settings),
    convert: (amount: number) => convertAmount(amount, settings),
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
