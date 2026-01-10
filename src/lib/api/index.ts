/**
 * API Module Exports
 * Central export point for all API integrations
 */

// FRED (Federal Reserve Economic Data)
export {
  fetchVIXData,
  fetchCreditSpreads,
  fetchSP500,
  fetchTreasuryRate,
  fetchFREDSeries,
  calculateZScore,
  calculatePercentile,
} from './fred'

// COT (Commitment of Traders)
export {
  fetchCOTData,
  fetchMultipleCOT,
  fetchCurrencyCOTDashboard,
  calculateCOTIndex,
  calculatePerformance,
  COT_CONTRACTS,
} from './cot'
export type { COTContractKey } from './cot'

// Coinalyze (Crypto Derivatives)
export {
  fetchFundingRates,
  fetchFundingHistory,
  fetchGlobalOI,
  fetchLiquidations,
  fetchLongShortRatio,
  CRYPTO_SYMBOLS,
} from './coinalyze'

// Deribit (Options Data)
export {
  fetchTermStructure,
  fetch25DeltaSkew,
  fetchVolatilityData,
  fetchVarianceRiskPremium,
  fetchOrderBookDepth,
  fetchIndexPrice,
} from './deribit'
export type { DeribitCurrency } from './deribit'
