/**
 * Coinalyze API Client
 * Free tier: 40 requests/minute
 *
 * Documentation: https://coinalyze.net/api/
 *
 * Available Data:
 * - Funding Rates (all major exchanges)
 * - Open Interest (aggregated across exchanges)
 * - Liquidations
 * - Long/Short Ratios
 */

import axios from 'axios'
import type {
  FundingRate,
  OpenInterest,
  LiquidationData,
  GlobalOI,
  FundingHeatmapData,
  ChartDataPoint
} from '@/types'

const COINALYZE_BASE_URL = 'https://api.coinalyze.net/v1'

// Note: Get your free API key at https://coinalyze.net
const COINALYZE_API_KEY = process.env.NEXT_PUBLIC_COINALYZE_API_KEY || ''

const apiClient = axios.create({
  baseURL: COINALYZE_BASE_URL,
  headers: {
    'api-key': COINALYZE_API_KEY,
  },
})

// Supported symbols
export const CRYPTO_SYMBOLS = [
  'BTC', 'ETH', 'SOL', 'XRP', 'HYPE', 'BNB', 'ZEC', 'DOGE', 'BCH',
  'SUI', 'ADA', 'ASTER', 'LINK', 'ENA', 'LTC', 'AVAX', 'UNI', 'TRX',
  'AAVE', 'NEAR', 'TRUMP', 'PAXG', 'FIL', 'WLFI', 'APT',
]

/**
 * Fetch current funding rates for all symbols
 */
export async function fetchFundingRates(): Promise<FundingRate[]> {
  try {
    const response = await apiClient.get('/funding-rate-live', {
      params: {
        symbols: CRYPTO_SYMBOLS.map(s => `${s}USDT`).join(','),
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching funding rates:', error)
    // Return mock data for demo
    return generateMockFundingRates()
  }
}

/**
 * Fetch historical funding rates for heatmap
 */
export async function fetchFundingHistory(
  symbols: string[] = CRYPTO_SYMBOLS,
  days: number = 30
): Promise<FundingHeatmapData> {
  try {
    const endTime = Date.now()
    const startTime = endTime - days * 24 * 60 * 60 * 1000

    const response = await apiClient.get('/funding-rate-history', {
      params: {
        symbols: symbols.map(s => `${s}USDT`).join(','),
        from: startTime,
        to: endTime,
        interval: '8h',
      },
    })

    return processFundingHeatmapData(response.data, symbols)
  } catch (error) {
    console.error('Error fetching funding history:', error)
    return generateMockFundingHeatmap(symbols, days)
  }
}

/**
 * Fetch global open interest
 */
export async function fetchGlobalOI(days: number = 365): Promise<GlobalOI[]> {
  try {
    const endTime = Date.now()
    const startTime = endTime - days * 24 * 60 * 60 * 1000

    const [btcOI, ethOI, totalOI] = await Promise.all([
      apiClient.get('/open-interest-history', {
        params: { symbols: 'BTCUSDT', from: startTime, to: endTime, interval: '1d' },
      }),
      apiClient.get('/open-interest-history', {
        params: { symbols: 'ETHUSDT', from: startTime, to: endTime, interval: '1d' },
      }),
      apiClient.get('/aggregate-open-interest', {
        params: { from: startTime, to: endTime, interval: '1d' },
      }),
    ])

    return processGlobalOIData(btcOI.data, ethOI.data, totalOI.data)
  } catch (error) {
    console.error('Error fetching global OI:', error)
    return generateMockGlobalOI(days)
  }
}

/**
 * Fetch liquidation data
 */
export async function fetchLiquidations(days: number = 365): Promise<LiquidationData[]> {
  try {
    const endTime = Date.now()
    const startTime = endTime - days * 24 * 60 * 60 * 1000

    const response = await apiClient.get('/liquidations-history', {
      params: {
        from: startTime,
        to: endTime,
        interval: '1d',
      },
    })

    return response.data.map((item: any) => ({
      timestamp: item.timestamp,
      longLiquidations: item.long_liquidations_usd || 0,
      shortLiquidations: item.short_liquidations_usd || 0,
      totalLiquidations: (item.long_liquidations_usd || 0) + (item.short_liquidations_usd || 0),
    }))
  } catch (error) {
    console.error('Error fetching liquidations:', error)
    return generateMockLiquidations(days)
  }
}

/**
 * Fetch Long/Short ratio
 */
export async function fetchLongShortRatio(symbol: string = 'BTC'): Promise<ChartDataPoint[]> {
  try {
    const response = await apiClient.get('/long-short-ratio', {
      params: { symbol: `${symbol}USDT` },
    })

    return response.data.map((item: any) => ({
      date: new Date(item.timestamp).toISOString().split('T')[0],
      value: item.longShortRatio,
      longPercent: item.longAccountRatio * 100,
      shortPercent: item.shortAccountRatio * 100,
    }))
  } catch (error) {
    console.error('Error fetching long/short ratio:', error)
    return []
  }
}

// Helper functions for processing data
function processFundingHeatmapData(
  rawData: any[],
  symbols: string[]
): FundingHeatmapData {
  const dates: string[] = []
  const data: number[][] = []

  // Group by date
  const byDate = new Map<string, Map<string, number>>()

  rawData.forEach((item) => {
    const date = new Date(item.timestamp).toISOString().split('T')[0]
    if (!byDate.has(date)) {
      byDate.set(date, new Map())
    }
    byDate.get(date)!.set(item.symbol.replace('USDT', ''), item.fundingRate * 100)
  })

  byDate.forEach((symbolData, date) => {
    dates.push(date)
    const row = symbols.map(s => symbolData.get(s) || 0)
    data.push(row)
  })

  return { dates, symbols, data }
}

function processGlobalOIData(btc: any[], eth: any[], total: any[]): GlobalOI[] {
  const byDate = new Map<string, { btc: number; eth: number; global: number }>()

  btc.forEach((item) => {
    const date = new Date(item.timestamp).toISOString().split('T')[0]
    byDate.set(date, { btc: item.openInterestUsd || 0, eth: 0, global: 0 })
  })

  eth.forEach((item) => {
    const date = new Date(item.timestamp).toISOString().split('T')[0]
    if (byDate.has(date)) {
      byDate.get(date)!.eth = item.openInterestUsd || 0
    }
  })

  total.forEach((item) => {
    const date = new Date(item.timestamp).toISOString().split('T')[0]
    if (byDate.has(date)) {
      byDate.get(date)!.global = item.openInterestUsd || 0
    }
  })

  return Array.from(byDate.entries()).map(([date, values]) => ({
    date,
    global: values.global,
    btc: values.btc,
    eth: values.eth,
    others: values.global - values.btc - values.eth,
  }))
}

// Mock data generators for demo/fallback
function generateMockFundingRates(): FundingRate[] {
  return CRYPTO_SYMBOLS.map(symbol => ({
    symbol: `${symbol}USDT`,
    exchange: 'aggregate',
    fundingRate: (Math.random() - 0.5) * 0.002,
    nextFundingTime: Date.now() + 8 * 60 * 60 * 1000,
    timestamp: Date.now(),
  }))
}

function generateMockFundingHeatmap(symbols: string[], days: number): FundingHeatmapData {
  const dates: string[] = []
  const data: number[][] = []

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dates.push(date.toISOString().split('T')[0])
    data.push(symbols.map(() => (Math.random() - 0.5) * 0.1))
  }

  return { dates, symbols, data }
}

function generateMockGlobalOI(days: number): GlobalOI[] {
  const result: GlobalOI[] = []
  let btc = 20_000_000_000
  let eth = 8_000_000_000

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    btc += (Math.random() - 0.5) * 1_000_000_000
    eth += (Math.random() - 0.5) * 500_000_000
    const others = (btc + eth) * 0.4

    result.push({
      date: date.toISOString().split('T')[0],
      global: btc + eth + others,
      btc,
      eth,
      others,
    })
  }

  return result
}

function generateMockLiquidations(days: number): LiquidationData[] {
  const result: LiquidationData[] = []

  for (let i = days; i >= 0; i--) {
    const timestamp = Date.now() - i * 24 * 60 * 60 * 1000
    const longLiq = Math.random() * 500_000_000
    const shortLiq = Math.random() * 500_000_000

    result.push({
      timestamp,
      longLiquidations: longLiq,
      shortLiquidations: shortLiq,
      totalLiquidations: longLiq + shortLiq,
    })
  }

  return result
}
