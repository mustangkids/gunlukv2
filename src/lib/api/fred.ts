/**
 * FRED (Federal Reserve Economic Data) API Client
 * Free API for economic data: VIX, Credit Spreads, Treasury Rates, etc.
 *
 * Documentation: https://fred.stlouisfed.org/docs/api/fred/
 *
 * Key Series IDs:
 * - VIXCLS: CBOE Volatility Index (VIX)
 * - BAMLH0A0HYM2: High Yield Bond Spread
 * - BAMLC0A4CBBB: Investment Grade Bond Spread
 * - DGS10: 10-Year Treasury Rate
 * - SP500: S&P 500 Index
 */

import axios from 'axios'
import type { FREDObservation, ChartDataPoint, CreditSpread, VIXData } from '@/types'

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations'

// Note: In production, store this in environment variables
// Get your free API key at: https://fred.stlouisfed.org/docs/api/api_key.html
const FRED_API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY || 'demo'

interface FREDParams {
  series_id: string
  observation_start?: string
  observation_end?: string
  frequency?: 'd' | 'w' | 'm' | 'q' | 'a'
  units?: 'lin' | 'chg' | 'ch1' | 'pch' | 'pc1' | 'pca' | 'cch' | 'cca' | 'log'
}

export async function fetchFREDSeries(params: FREDParams): Promise<FREDObservation[]> {
  try {
    const response = await axios.get(FRED_BASE_URL, {
      params: {
        ...params,
        api_key: FRED_API_KEY,
        file_type: 'json',
      },
    })

    return response.data.observations.filter(
      (obs: FREDObservation) => obs.value !== '.'
    )
  } catch (error) {
    console.error(`Error fetching FRED series ${params.series_id}:`, error)
    throw error
  }
}

/**
 * Fetch VIX data from FRED
 */
export async function fetchVIXData(startDate?: string): Promise<VIXData[]> {
  const observations = await fetchFREDSeries({
    series_id: 'VIXCLS',
    observation_start: startDate || '2020-01-01',
    frequency: 'd',
  })

  return observations.map(obs => ({
    date: obs.date,
    vix: parseFloat(obs.value),
  }))
}

/**
 * Fetch Credit Spreads (High Yield and Investment Grade)
 */
export async function fetchCreditSpreads(startDate?: string): Promise<CreditSpread[]> {
  const [hyData, igData] = await Promise.all([
    fetchFREDSeries({
      series_id: 'BAMLH0A0HYM2', // High Yield
      observation_start: startDate || '2020-01-01',
      frequency: 'd',
    }),
    fetchFREDSeries({
      series_id: 'BAMLC0A4CBBB', // Investment Grade
      observation_start: startDate || '2020-01-01',
      frequency: 'd',
    }),
  ])

  // Create a map for efficient lookup
  const igMap = new Map(igData.map(obs => [obs.date, parseFloat(obs.value)]))

  return hyData
    .filter(obs => igMap.has(obs.date))
    .map(obs => {
      const hy = parseFloat(obs.value)
      const ig = igMap.get(obs.date) || 0
      return {
        date: obs.date,
        hy,
        ig,
        spread: hy - ig,
      }
    })
}

/**
 * Fetch S&P 500 data from FRED
 */
export async function fetchSP500(startDate?: string): Promise<ChartDataPoint[]> {
  const observations = await fetchFREDSeries({
    series_id: 'SP500',
    observation_start: startDate || '2020-01-01',
    frequency: 'd',
  })

  return observations.map(obs => ({
    date: obs.date,
    value: parseFloat(obs.value),
  }))
}

/**
 * Fetch 10-Year Treasury Rate
 */
export async function fetchTreasuryRate(startDate?: string): Promise<ChartDataPoint[]> {
  const observations = await fetchFREDSeries({
    series_id: 'DGS10',
    observation_start: startDate || '2020-01-01',
    frequency: 'd',
  })

  return observations.map(obs => ({
    date: obs.date,
    value: parseFloat(obs.value),
  }))
}

/**
 * Calculate Z-Score for a data series
 */
export function calculateZScore(
  data: ChartDataPoint[],
  lookbackPeriod: number = 252
): ChartDataPoint[] {
  return data.map((point, index) => {
    if (index < lookbackPeriod) {
      return { ...point, zScore: 0 }
    }

    const window = data.slice(index - lookbackPeriod, index)
    const values = window.map(d => d.value)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    )

    const zScore = stdDev !== 0 ? (point.value - mean) / stdDev : 0

    return { ...point, zScore }
  })
}

/**
 * Calculate percentile for current value within historical range
 */
export function calculatePercentile(
  currentValue: number,
  historicalValues: number[]
): number {
  const sorted = [...historicalValues].sort((a, b) => a - b)
  const rank = sorted.filter(v => v < currentValue).length
  return (rank / sorted.length) * 100
}
