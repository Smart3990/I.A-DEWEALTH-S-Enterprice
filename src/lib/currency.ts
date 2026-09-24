/**
 * Currency utilities for Ghanaian Cedi (GHC).
 */

export function formatGHS(amount: number): string {
  return `GHC ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export const cedi = formatGHS;
