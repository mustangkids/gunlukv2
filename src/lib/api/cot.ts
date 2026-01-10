/**
 * CFTC Commitment of Traders (COT) API Client
 * Free data from the Commodity Futures Trading Commission
 *
 * Data Source: https://publicreporting.cftc.gov
 *
 * Available Markets:
 * - Currencies: EUR, GBP, JPY, CHF, CAD, AUD, NZD, MXN
 * - Commodities: Gold, Silver, Copper, Crude Oil, Natural Gas
 * - Indices: S&P 500, Dow Jones, Nasdaq, VIX
 * - Bonds: 2Y, 5Y, 10Y, 30Y Treasury
 */

import axios from 'axios'
import type { COTData, COTIndexData, ChartDataPoint } from '@/types'

// CFTC CKAN API endpoint
const CFTC_BASE_URL = 'https://publicreporting.cftc.gov/resource'

// Dataset IDs for different report types
const DATASETS = {
  // Legacy Report (Futures Only)
  LEGACY_FUTURES: '6dca-aqww',
  // Disaggregated Report
  DISAGGREGATED: '72hh-3qpy',
  // Traders in Financial Futures
  FINANCIAL: 'gpe5-46if',
}

// Contract codes for common instruments
export const COT_CONTRACTS = {
  // Currencies
  EUR: '099741',
  GBP: '096742',
  JPY: '097741',
  CHF: '092741',
  CAD: '090741',
  AUD: '232741',
  // Commodities
  GOLD: '088691',
  SILVER: '084691',
  CRUDE_OIL: '067651',
  NATURAL_GAS: '023651',
  // Indices
  SP500: '13874A',
  NASDAQ: '20974P',
  VIX: '1170E1',
  // Bonds
  TREASURY_10Y: '043602',
  TREASURY_2Y: '042601',
}

export type COTContractKey = keyof typeof COT_CONTRACTS

interface COTRawData {
  report_date_as_yyyy_mm_dd: string
  contract_market_name: string
  cftc_contract_market_code: string
  comm_positions_long_all: string
  comm_positions_short_all: string
  noncomm_positions_long_all: string
  noncomm_positions_short_all: string
  nonrept_positions_long_all: string
  nonrept_positions_short_all: string
  open_interest_all: string
}

/**
 * Fetch COT data for a specific contract
 */
export async function fetchCOTData(
  contractCode: string,
  limit: number = 156 // ~3 years of weekly data
): Promise<COTData[]> {
  try {
    const response = await axios.get(`${CFTC_BASE_URL}/${DATASETS.LEGACY_FUTURES}.json`, {
      params: {
        cftc_contract_market_code: contractCode,
        $limit: limit,
        $order: 'report_date_as_yyyy_mm_dd DESC',
      },
    })

    return response.data
      .map((row: COTRawData) => ({
        date: row.report_date_as_yyyy_mm_dd,
        commercial_long: parseInt(row.comm_positions_long_all) || 0,
        commercial_short: parseInt(row.comm_positions_short_all) || 0,
        commercial_net: (parseInt(row.comm_positions_long_all) || 0) -
                        (parseInt(row.comm_positions_short_all) || 0),
        large_spec_long: parseInt(row.noncomm_positions_long_all) || 0,
        large_spec_short: parseInt(row.noncomm_positions_short_all) || 0,
        large_spec_net: (parseInt(row.noncomm_positions_long_all) || 0) -
                        (parseInt(row.noncomm_positions_short_all) || 0),
        small_spec_long: parseInt(row.nonrept_positions_long_all) || 0,
        small_spec_short: parseInt(row.nonrept_positions_short_all) || 0,
        small_spec_net: (parseInt(row.nonrept_positions_long_all) || 0) -
                        (parseInt(row.nonrept_positions_short_all) || 0),
      }))
      .reverse() // Chronological order
  } catch (error) {
    console.error(`Error fetching COT data for ${contractCode}:`, error)
    throw error
  }
}

/**
 * Calculate COT Index (0-100 scale)
 * Formula: ((Current - 3yr Low) / (3yr High - 3yr Low)) * 100
 */
export function calculateCOTIndex(
  data: COTData[],
  lookbackWeeks: number = 156 // 3 years
): COTIndexData[] {
  return data.map((point, index) => {
    const startIdx = Math.max(0, index - lookbackWeeks + 1)
    const window = data.slice(startIdx, index + 1)

    // Commercial Index
    const commNets = window.map(d => d.commercial_net)
    const commMin = Math.min(...commNets)
    const commMax = Math.max(...commNets)
    const commRange = commMax - commMin
    const commercialIndex = commRange !== 0
      ? ((point.commercial_net - commMin) / commRange) * 100
      : 50

    // Large Speculator Index
    const specNets = window.map(d => d.large_spec_net)
    const specMin = Math.min(...specNets)
    const specMax = Math.max(...specNets)
    const specRange = specMax - specMin
    const largeSpecIndex = specRange !== 0
      ? ((point.large_spec_net - specMin) / specRange) * 100
      : 50

    return {
      date: point.date,
      commercial_index: Math.round(commercialIndex * 100) / 100,
      large_spec_index: Math.round(largeSpecIndex * 100) / 100,
    }
  })
}

/**
 * Fetch COT data for multiple contracts (for currency dashboard)
 */
export async function fetchMultipleCOT(
  contracts: COTContractKey[]
): Promise<Map<string, COTIndexData[]>> {
  const results = new Map<string, COTIndexData[]>()

  await Promise.all(
    contracts.map(async (contract) => {
      const data = await fetchCOTData(COT_CONTRACTS[contract])
      const indexData = calculateCOTIndex(data)
      results.set(contract, indexData)
    })
  )

  return results
}

/**
 * Get currency performance data for COT dashboard
 */
export async function fetchCurrencyCOTDashboard(): Promise<{
  cotIndex: COTIndexData[]
  netPositions: COTData[]
}> {
  // Fetch EUR as the primary currency for the main chart
  const eurData = await fetchCOTData(COT_CONTRACTS.EUR)
  const cotIndex = calculateCOTIndex(eurData)

  return {
    cotIndex,
    netPositions: eurData,
  }
}

/**
 * Calculate performance from COT data
 */
export function calculatePerformance(
  data: ChartDataPoint[],
  startDate: string
): ChartDataPoint[] {
  const startIdx = data.findIndex(d => d.date >= startDate)
  if (startIdx === -1) return data

  const startValue = data[startIdx].value

  return data.slice(startIdx).map(point => ({
    ...point,
    performance: ((point.value - startValue) / startValue) * 100,
  }))
}
