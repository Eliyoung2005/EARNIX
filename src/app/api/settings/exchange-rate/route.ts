export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * Fetches the current real-time USD to NGN exchange rate from multiple free APIs.
 * Falls back gracefully if APIs are unavailable.
 */
export async function GET() {
  try {
    // Try primary source: exchangerate-api (free, no key needed)
    const res1 = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });

    if (res1.ok) {
      const data = await res1.json();
      if (data?.rates?.NGN) {
        return NextResponse.json({
          rate: data.rates.NGN,
          source: 'open.er-api.com',
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (e) {
    console.error('Primary exchange rate API failed:', e);
  }

  try {
    // Fallback source
    const res2 = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=NGN', {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });

    if (res2.ok) {
      const data = await res2.json();
      if (data?.rates?.NGN) {
        return NextResponse.json({
          rate: data.rates.NGN,
          source: 'exchangerate.host',
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (e) {
    console.error('Fallback exchange rate API failed:', e);
  }

  // If all APIs fail, return a safe default
  return NextResponse.json({
    rate: null,
    source: 'unavailable',
    timestamp: new Date().toISOString(),
    error: 'Could not fetch live rate. Please enter manually.',
  });
}
