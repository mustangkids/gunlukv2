// FRED API Types
export interface FREDObservation {
  date: string
  value: string
}

export interface FREDSeriesData {
  observations: FREDObservation[]
}

// COT (Commitment of Traders) Types
export interface COTData {
  date: string
  commercial_long: number
  commercial_short: number
  commercial_net: number
  large_spec_long: number
  large_spec_short: number
  large_spec_net: number
  small_spec_long: number
  small_spec_short: number
  small_spec_net: number
}

export interface COTIndexData {
  date: string
  commercial_index: number
  large_spec_index: number
}

// Coinalyze Types (Crypto Derivatives)
export interface FundingRate {
  symbol: string
  exchange: string
  fundingRate: number
  nextFundingTime: number
  timestamp: number
}

export interface OpenInterest {
  symbol: string
  openInterest: number
  openInterestUsd: number
  timestamp: number
}

export interface LiquidationData {
  timestamp: number
  longLiquidations: number
  shortLiquidations: number
  totalLiquidations: number
}

export interface GlobalOI {
  date: string
  global: number
  btc: number
  eth: number
  others: number
}

// Deribit Options Types
export interface TermStructurePoint {
  tenor: string
  days: number
  iv: number
  current: number
  min: number
  max: number
  median: number
  percentile25: number
  percentile75: number
}

export interface SkewData {
  date: string
  skew25d: number
  skew10d?: number
}

export interface VarianceRiskPremium {
  date: string
  vrp: number
  iv: number
  rv: number
}

// VIX Types
export interface VIXData {
  date: string
  vix: number
  vix9d?: number
  vix3m?: number
  vix6m?: number
}

export interface VIXTermStructure {
  tenor: string
  value: number
}

// Credit Spread Types
export interface CreditSpread {
  date: string
  hy: number  // High Yield
  ig: number  // Investment Grade
  spread: number
}

// Chart Common Types
export interface ChartDataPoint {
  date: string
  value: number
  [key: string]: string | number
}

export interface TimeSeriesData {
  date: string
  [key: string]: string | number
}

// Dashboard Types
export interface DashboardCard {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  isPositive?: boolean
}

// Heatmap Types
export interface HeatmapCell {
  x: string
  y: string
  value: number
}

export interface FundingHeatmapData {
  dates: string[]
  symbols: string[]
  data: number[][]
}

// Performance Types
export interface PerformanceData {
  date: string
  [symbol: string]: string | number
}

// API Response Types
export interface APIResponse<T> {
  data: T
  error?: string
  timestamp: number
}
