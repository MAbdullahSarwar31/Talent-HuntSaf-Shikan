/**
 * Format currency in Pakistani Rupees (PKR) or clean compact notation
 */
export function formatPKR(amount: number, compact = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `PKR ${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `PKR ${(amount / 1_000).toFixed(0)}k`;
    }
    return `PKR ${amount.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'PKR ');
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format flight or maintenance duration hours
 */
export function formatHours(hours: number): string {
  return `${hours.toFixed(1)} hrs`;
}

/**
 * Format date clean
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Helper to get status color badge tokens
 */
export function getScoreBandColor(band: string): { bg: string; text: string; border: string; dot: string } {
  switch (band) {
    case 'excellent':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'good':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' };
    case 'average':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'poor':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' };
    case 'critical':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  }
}
