/**
 * Formatting utilities for the trading dashboard
 */

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  const absValue = Math.abs(value)

  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Format currency value
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  decimals: number = 2
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format date for chart axis
 */
export function formatChartDate(dateStr: string, format: 'short' | 'medium' | 'long' = 'short'): string {
  const date = new Date(dateStr)

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'medium':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
    case 'long':
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    default:
      return dateStr
  }
}

/**
 * Format timestamp to date string
 */
export function timestampToDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0]
}

/**
 * Get color based on value (red/green)
 */
export function getValueColor(value: number): string {
  if (value > 0) return '#3fb950' // green
  if (value < 0) return '#f85149' // red
  return '#8b949e' // neutral
}

/**
 * Get heatmap color based on value
 */
export function getHeatmapColor(value: number, min: number = -0.1, max: number = 0.1): string {
  // Normalize value to 0-1 range
  const normalized = (value - min) / (max - min)
  const clamped = Math.max(0, Math.min(1, normalized))

  // Purple (negative) -> Cyan (neutral) -> Yellow (positive)
  if (clamped < 0.5) {
    // Purple to Cyan
    const t = clamped * 2
    const r = Math.round(147 * (1 - t) + 57 * t)
    const g = Math.round(51 * (1 - t) + 197 * t)
    const b = Math.round(234 * (1 - t) + 207 * t)
    return `rgb(${r}, ${g}, ${b})`
  } else {
    // Cyan to Yellow
    const t = (clamped - 0.5) * 2
    const r = Math.round(57 * (1 - t) + 227 * t)
    const g = Math.round(197 * (1 - t) + 179 * t)
    const b = Math.round(207 * (1 - t) + 65 * t)
    return `rgb(${r}, ${g}, ${b})`
  }
}

/**
 * Calculate Y-axis domain with padding
 */
export function calculateYDomain(
  data: number[],
  padding: number = 0.1
): [number, number] {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min
  const paddingAmount = range * padding

  return [min - paddingAmount, max + paddingAmount]
}
