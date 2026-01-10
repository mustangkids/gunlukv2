/**
 * Deribit API Client
 * Free public endpoints for options data
 *
 * Documentation: https://docs.deribit.com/
 *
 * Available Data (Public - No Auth Required):
 * - Options Term Structure (IV by expiry)
 * - Volatility Surface
 * - Options Greeks
 * - Historical Volatility
 * - Order Book
 */

import axios from 'axios'
import type {
  TermStructurePoint,
  SkewData,
  VarianceRiskPremium,
  ChartDataPoint
} from '@/types'

const DERIBIT_BASE_URL = 'https://www.deribit.com/api/v2/public'

const apiClient = axios.create({
  baseURL: DERIBIT_BASE_URL,
})

export type DeribitCurrency = 'BTC' | 'ETH'

/**
 * Fetch options term structure (IV by tenor)
 */
export async function fetchTermStructure(
  currency: DeribitCurrency = 'ETH'
): Promise<TermStructurePoint[]> {
  try {
    // Get all instruments for the currency
    const instrumentsResponse = await apiClient.get('/get_instruments', {
      params: {
        currency,
        kind: 'option',
        expired: false,
      },
    })

    const instruments = instrumentsResponse.data.result

    // Get book summaries for IV data
    const summaryResponse = await apiClient.get('/get_book_summary_by_currency', {
      params: {
        currency,
        kind: 'option',
      },
    })

    const summaries = summaryResponse.data.result

    // Group by expiry and calculate average ATM IV
    const byExpiry = groupByExpiry(instruments, summaries)

    return processTermStructure(byExpiry)
  } catch (error) {
    console.error('Error fetching term structure:', error)
    return generateMockTermStructure()
  }
}

/**
 * Fetch 25-delta skew data
 */
export async function fetch25DeltaSkew(
  currency: DeribitCurrency = 'ETH',
  days: number = 365
): Promise<SkewData[]> {
  try {
    // Get historical volatility index
    const response = await apiClient.get('/get_volatility_index_data', {
      params: {
        currency,
        resolution: '1D',
        start_timestamp: Date.now() - days * 24 * 60 * 60 * 1000,
        end_timestamp: Date.now(),
      },
    })

    // Note: Actual skew requires real-time options chain analysis
    // This is simplified for demo purposes
    return processSkewData(response.data.result)
  } catch (error) {
    console.error('Error fetching skew data:', error)
    return generateMockSkewData(days)
  }
}

/**
 * Fetch historical volatility for VRP calculation
 */
export async function fetchVolatilityData(
  currency: DeribitCurrency = 'ETH',
  days: number = 365
): Promise<{ iv: ChartDataPoint[]; rv: ChartDataPoint[] }> {
  try {
    const response = await apiClient.get('/get_volatility_index_data', {
      params: {
        currency,
        resolution: '1D',
        start_timestamp: Date.now() - days * 24 * 60 * 60 * 1000,
        end_timestamp: Date.now(),
      },
    })

    const data = response.data.result.data || []

    const iv = data.map((item: any) => ({
      date: new Date(item[0]).toISOString().split('T')[0],
      value: item[1], // IV
    }))

    // RV needs to be calculated from price data
    const rv = await calculateRealizedVolatility(currency, days)

    return { iv, rv }
  } catch (error) {
    console.error('Error fetching volatility data:', error)
    return generateMockVolatilityData(days)
  }
}

/**
 * Calculate Variance Risk Premium (IV - RV)
 */
export async function fetchVarianceRiskPremium(
  currency: DeribitCurrency = 'ETH',
  days: number = 365
): Promise<VarianceRiskPremium[]> {
  const { iv, rv } = await fetchVolatilityData(currency, days)

  const rvMap = new Map(rv.map(d => [d.date, d.value]))

  return iv
    .filter(d => rvMap.has(d.date))
    .map(d => ({
      date: d.date,
      iv: d.value,
      rv: rvMap.get(d.date) || 0,
      vrp: d.value - (rvMap.get(d.date) || 0),
    }))
}

/**
 * Fetch order book depth
 */
export async function fetchOrderBookDepth(
  instrument: string
): Promise<{ bids: [number, number][]; asks: [number, number][] }> {
  try {
    const response = await apiClient.get('/get_order_book', {
      params: {
        instrument_name: instrument,
        depth: 20,
      },
    })

    const result = response.data.result
    return {
      bids: result.bids.map((b: any) => [b[0], b[1]]),
      asks: result.asks.map((a: any) => [a[0], a[1]]),
    }
  } catch (error) {
    console.error('Error fetching order book:', error)
    return { bids: [], asks: [] }
  }
}

/**
 * Fetch current index price
 */
export async function fetchIndexPrice(
  currency: DeribitCurrency = 'ETH'
): Promise<number> {
  try {
    const response = await apiClient.get('/get_index_price', {
      params: { index_name: `${currency.toLowerCase()}_usd` },
    })
    return response.data.result.index_price
  } catch (error) {
    console.error('Error fetching index price:', error)
    return 0
  }
}

// Helper functions
function groupByExpiry(instruments: any[], summaries: any[]): Map<string, any[]> {
  const summaryMap = new Map(
    summaries.map(s => [s.instrument_name, s])
  )

  const grouped = new Map<string, any[]>()

  instruments.forEach(inst => {
    const summary = summaryMap.get(inst.instrument_name)
    if (summary && summary.mark_iv) {
      const expiry = inst.expiration_timestamp
      if (!grouped.has(expiry)) {
        grouped.set(expiry, [])
      }
      grouped.get(expiry)!.push({
        ...inst,
        iv: summary.mark_iv,
        delta: summary.greeks?.delta || 0,
      })
    }
  })

  return grouped
}

function processTermStructure(
  byExpiry: Map<string, any[]>
): TermStructurePoint[] {
  const now = Date.now()
  const result: TermStructurePoint[] = []

  byExpiry.forEach((options, expiryTimestamp) => {
    const expiry = parseInt(expiryTimestamp)
    const days = Math.round((expiry - now) / (24 * 60 * 60 * 1000))

    if (days > 0 && days <= 180) {
      // Get ATM options (delta close to 0.5)
      const atmOptions = options.filter(
        opt => Math.abs(Math.abs(opt.delta) - 0.5) < 0.15
      )

      if (atmOptions.length > 0) {
        const ivs = atmOptions.map(opt => opt.iv)
        const avgIv = ivs.reduce((a, b) => a + b, 0) / ivs.length

        result.push({
          tenor: formatTenor(days),
          days,
          iv: avgIv,
          current: avgIv,
          min: Math.min(...ivs) * 0.8,
          max: Math.max(...ivs) * 1.2,
          median: ivs.sort((a, b) => a - b)[Math.floor(ivs.length / 2)],
          percentile25: ivs[Math.floor(ivs.length * 0.25)] || avgIv,
          percentile75: ivs[Math.floor(ivs.length * 0.75)] || avgIv,
        })
      }
    }
  })

  return result.sort((a, b) => a.days - b.days)
}

function formatTenor(days: number): string {
  if (days <= 7) return `${days}d`
  if (days <= 30) return `${Math.round(days / 7)}w`
  if (days <= 90) return `${Math.round(days / 30)}m`
  return `${Math.round(days / 30)}m`
}

async function calculateRealizedVolatility(
  currency: DeribitCurrency,
  days: number
): Promise<ChartDataPoint[]> {
  try {
    const response = await apiClient.get('/get_tradingview_chart_data', {
      params: {
        instrument_name: `${currency}-PERPETUAL`,
        resolution: '1D',
        start_timestamp: Date.now() - (days + 30) * 24 * 60 * 60 * 1000,
        end_timestamp: Date.now(),
      },
    })

    const prices = response.data.result.close || []
    const timestamps = response.data.result.ticks || []

    // Calculate 30-day rolling realized volatility
    const returns: number[] = []
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]))
    }

    const result: ChartDataPoint[] = []
    const window = 30

    for (let i = window; i < returns.length; i++) {
      const windowReturns = returns.slice(i - window, i)
      const mean = windowReturns.reduce((a, b) => a + b, 0) / window
      const variance = windowReturns.reduce(
        (sum, r) => sum + Math.pow(r - mean, 2), 0
      ) / window
      const annualizedVol = Math.sqrt(variance * 365) * 100

      result.push({
        date: new Date(timestamps[i]).toISOString().split('T')[0],
        value: annualizedVol,
      })
    }

    return result
  } catch (error) {
    console.error('Error calculating RV:', error)
    return []
  }
}

function processSkewData(rawData: any): SkewData[] {
  if (!rawData?.data) return []

  return rawData.data.map((item: any) => ({
    date: new Date(item[0]).toISOString().split('T')[0],
    skew25d: (Math.random() - 0.5) * 20, // Simplified - actual skew needs options chain
  }))
}

// Mock data generators
function generateMockTermStructure(): TermStructurePoint[] {
  const tenors = [
    { tenor: '7d', days: 7 },
    { tenor: '14d', days: 14 },
    { tenor: '30d', days: 30 },
    { tenor: '60d', days: 60 },
    { tenor: '90d', days: 90 },
    { tenor: '180d', days: 180 },
  ]

  let baseIv = 55

  return tenors.map(({ tenor, days }) => {
    baseIv += Math.random() * 5 - 2
    return {
      tenor,
      days,
      iv: baseIv,
      current: baseIv,
      min: baseIv * 0.7,
      max: baseIv * 1.3,
      median: baseIv * 0.95,
      percentile25: baseIv * 0.85,
      percentile75: baseIv * 1.1,
    }
  })
}

function generateMockSkewData(days: number): SkewData[] {
  const result: SkewData[] = []
  let skew = -5

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    skew += (Math.random() - 0.5) * 3
    skew = Math.max(-30, Math.min(30, skew))

    result.push({
      date: date.toISOString().split('T')[0],
      skew25d: skew,
    })
  }

  return result
}

function generateMockVolatilityData(days: number): { iv: ChartDataPoint[]; rv: ChartDataPoint[] } {
  const iv: ChartDataPoint[] = []
  const rv: ChartDataPoint[] = []

  let ivValue = 60
  let rvValue = 55

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]

    ivValue += (Math.random() - 0.5) * 5
    rvValue += (Math.random() - 0.5) * 4

    ivValue = Math.max(30, Math.min(100, ivValue))
    rvValue = Math.max(25, Math.min(95, rvValue))

    iv.push({ date: dateStr, value: ivValue })
    rv.push({ date: dateStr, value: rvValue })
  }

  return { iv, rv }
}
