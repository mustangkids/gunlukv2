'use client'

import useSWR from 'swr'
import {
  fetchVIXData,
  fetchCreditSpreads,
  fetchSP500,
  fetchCOTData,
  calculateCOTIndex,
  fetchFundingHistory,
  fetchGlobalOI,
  fetchLiquidations,
  fetchTermStructure,
  fetch25DeltaSkew,
  fetchVarianceRiskPremium,
  COT_CONTRACTS,
} from '@/lib/api'
import type {
  VIXData,
  CreditSpread,
  ChartDataPoint,
  COTIndexData,
  COTData,
  GlobalOI,
  LiquidationData,
  TermStructurePoint,
  SkewData,
  VarianceRiskPremium,
  FundingHeatmapData,
} from '@/types'

// SWR configuration for market data
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  refreshInterval: 300000, // 5 minutes
}

/**
 * Hook for VIX data
 */
export function useVIXData(startDate?: string) {
  return useSWR<VIXData[]>(
    ['vix', startDate],
    () => fetchVIXData(startDate),
    swrConfig
  )
}

/**
 * Hook for Credit Spreads
 */
export function useCreditSpreads(startDate?: string) {
  return useSWR<CreditSpread[]>(
    ['creditSpreads', startDate],
    () => fetchCreditSpreads(startDate),
    swrConfig
  )
}

/**
 * Hook for S&P 500 data
 */
export function useSP500Data(startDate?: string) {
  return useSWR<ChartDataPoint[]>(
    ['sp500', startDate],
    () => fetchSP500(startDate),
    swrConfig
  )
}

/**
 * Hook for COT data with index calculation
 */
export function useCOTData(contractCode: string = COT_CONTRACTS.EUR) {
  return useSWR<{ raw: COTData[]; index: COTIndexData[] }>(
    ['cot', contractCode],
    async () => {
      const raw = await fetchCOTData(contractCode)
      const index = calculateCOTIndex(raw)
      return { raw, index }
    },
    swrConfig
  )
}

/**
 * Hook for Funding Rate Heatmap
 */
export function useFundingHeatmap(days: number = 30) {
  return useSWR<FundingHeatmapData>(
    ['fundingHeatmap', days],
    () => fetchFundingHistory(undefined, days),
    swrConfig
  )
}

/**
 * Hook for Global Open Interest
 */
export function useGlobalOI(days: number = 365) {
  return useSWR<GlobalOI[]>(
    ['globalOI', days],
    () => fetchGlobalOI(days),
    swrConfig
  )
}

/**
 * Hook for Liquidations
 */
export function useLiquidations(days: number = 365) {
  return useSWR<LiquidationData[]>(
    ['liquidations', days],
    () => fetchLiquidations(days),
    swrConfig
  )
}

/**
 * Hook for Options Term Structure
 */
export function useTermStructure(currency: 'BTC' | 'ETH' = 'ETH') {
  return useSWR<TermStructurePoint[]>(
    ['termStructure', currency],
    () => fetchTermStructure(currency),
    swrConfig
  )
}

/**
 * Hook for 25-Delta Skew
 */
export function use25DeltaSkew(currency: 'BTC' | 'ETH' = 'ETH', days: number = 365) {
  return useSWR<SkewData[]>(
    ['skew25d', currency, days],
    () => fetch25DeltaSkew(currency, days),
    swrConfig
  )
}

/**
 * Hook for Variance Risk Premium
 */
export function useVarianceRiskPremium(currency: 'BTC' | 'ETH' = 'ETH', days: number = 365) {
  return useSWR<VarianceRiskPremium[]>(
    ['vrp', currency, days],
    () => fetchVarianceRiskPremium(currency, days),
    swrConfig
  )
}

/**
 * Combined hook for Crypto dashboard data
 */
export function useCryptoDashboard() {
  const { data: fundingHeatmap, error: fundingError, isLoading: fundingLoading } = useFundingHeatmap(30)
  const { data: globalOI, error: oiError, isLoading: oiLoading } = useGlobalOI(365)
  const { data: liquidations, error: liqError, isLoading: liqLoading } = useLiquidations(365)

  return {
    fundingHeatmap,
    globalOI,
    liquidations,
    isLoading: fundingLoading || oiLoading || liqLoading,
    error: fundingError || oiError || liqError,
  }
}

/**
 * Combined hook for Options dashboard data
 */
export function useOptionsDashboard(currency: 'BTC' | 'ETH' = 'ETH') {
  const { data: termStructure, isLoading: tsLoading } = useTermStructure(currency)
  const { data: skew, isLoading: skewLoading } = use25DeltaSkew(currency)
  const { data: vrp, isLoading: vrpLoading } = useVarianceRiskPremium(currency)

  return {
    termStructure,
    skew,
    vrp,
    isLoading: tsLoading || skewLoading || vrpLoading,
  }
}

/**
 * Combined hook for Traditional Markets dashboard
 */
export function useTraditionalMarkets(startDate: string = '2020-01-01') {
  const { data: vix, isLoading: vixLoading } = useVIXData(startDate)
  const { data: credit, isLoading: creditLoading } = useCreditSpreads(startDate)
  const { data: sp500, isLoading: sp500Loading } = useSP500Data(startDate)

  return {
    vix,
    credit,
    sp500,
    isLoading: vixLoading || creditLoading || sp500Loading,
  }
}
