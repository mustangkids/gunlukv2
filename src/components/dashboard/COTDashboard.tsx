'use client'

import { useState } from 'react'
import { Card, TimeframeSelector } from '@/components/ui/Card'
import { LineChart, DualAxisLineChart } from '@/components/charts/LineChart'
import { useCOTData } from '@/lib/hooks/useMarketData'
import { COT_CONTRACTS, COTContractKey } from '@/lib/api'

const CURRENCY_COLORS: Record<string, string> = {
  EUR: '#58a6ff',
  GBP: '#d29922',
  JPY: '#3fb950',
  AUD: '#f0883e',
  CAD: '#39c5cf',
  CHF: '#f85149',
}

const CATEGORY_TABS = ['Indices', 'Bonds', 'Currencies', 'Metals', 'Energies', 'Grains', 'Meats', 'Softs'] as const

export function COTDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORY_TABS[number]>('Currencies')
  const [timeframe, setTimeframe] = useState('3Y')

  // Fetch COT data for EUR (primary currency)
  const { data: eurCOT, isLoading } = useCOTData(COT_CONTRACTS.EUR)

  // Currency performance mock data
  const currencyPerformance = generateCurrencyPerformance()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-tr-text">Commitment of Traders</h2>
        <div className="h-64 skeleton rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 border-b border-tr-border pb-2 overflow-x-auto">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedCategory(tab)}
            className={`px-3 py-1.5 text-sm rounded-t transition-colors whitespace-nowrap ${
              selectedCategory === tab
                ? 'text-tr-orange border-b-2 border-tr-orange'
                : 'text-tr-muted hover:text-tr-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* COT Index */}
        <Card title="COT Index" subtitle={selectedCategory}>
          {eurCOT && (
            <LineChart
              data={eurCOT.index}
              lines={[
                { dataKey: 'commercial_index', color: '#f85149', name: 'Commercial' },
                { dataKey: 'large_spec_index', color: '#58a6ff', name: 'Large Spec' },
              ]}
              height={300}
              referenceLines={[
                { y: 75, color: '#30363d' },
                { y: 25, color: '#30363d' },
              ]}
              yDomain={[0, 100]}
              yAxisFormatter={(v) => v.toFixed(0)}
            />
          )}
        </Card>

        {/* Net Positions */}
        <Card title="Net Positions" subtitle={selectedCategory}>
          {eurCOT && (
            <LineChart
              data={eurCOT.raw.map(d => ({
                date: d.date,
                commercial: d.commercial_net / 1000,
                largeSpec: d.large_spec_net / 1000,
              }))}
              lines={[
                { dataKey: 'commercial', color: '#f85149', name: 'Commercial' },
                { dataKey: 'largeSpec', color: '#58a6ff', name: 'Large Spec' },
              ]}
              height={300}
              referenceLines={[{ y: 0, color: '#30363d' }]}
              yAxisFormatter={(v) => `${v.toFixed(0)}K`}
            />
          )}
        </Card>
      </div>

      {/* Performance Chart */}
      <Card title="Performance" subtitle={selectedCategory}>
        <LineChart
          data={currencyPerformance}
          lines={Object.keys(CURRENCY_COLORS).map(currency => ({
            dataKey: currency,
            color: CURRENCY_COLORS[currency],
            name: currency,
          }))}
          height={350}
          referenceLines={[{ y: 0, color: '#30363d' }]}
          yAxisFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
          showLegend={true}
        />
        {/* Legend with values */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
          {Object.entries(CURRENCY_COLORS).map(([currency, color]) => {
            const lastValue = currencyPerformance[currencyPerformance.length - 1]?.[currency] || 0
            return (
              <span key={currency} className="flex items-center gap-1">
                <span
                  className="w-3 h-0.5"
                  style={{ backgroundColor: color }}
                />
                <span style={{ color }}>{currency}</span>
                <span className={lastValue >= 0 ? 'text-tr-green' : 'text-tr-red'}>
                  {lastValue >= 0 ? '+' : ''}{lastValue.toFixed(1)}%
                </span>
              </span>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// Generate mock currency performance data
function generateCurrencyPerformance() {
  const data: any[] = []
  const currencies = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF']
  const values: Record<string, number> = {}

  currencies.forEach(c => {
    values[c] = 0
  })

  // Generate ~5 years of weekly data
  for (let i = 260; i >= 0; i--) {
    const date = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]

    const point: any = { date: dateStr }

    currencies.forEach(c => {
      values[c] += (Math.random() - 0.5) * 1.5
      // Add some mean reversion
      values[c] *= 0.99
      point[c] = values[c]
    })

    data.push(point)
  }

  return data
}
