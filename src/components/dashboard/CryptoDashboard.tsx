'use client'

import { useState } from 'react'
import { Card, TimeframeSelector, StatCard } from '@/components/ui/Card'
import { LineChart, DualAxisLineChart } from '@/components/charts/LineChart'
import { StackedAreaChart } from '@/components/charts/AreaChart'
import { LiquidationBarChart } from '@/components/charts/BarChart'
import { FundingHeatmap } from '@/components/charts/Heatmap'
import { useCryptoDashboard, useGlobalOI } from '@/lib/hooks/useMarketData'
import { formatCompactNumber, formatPercentage } from '@/lib/utils/format'

export function CryptoDashboard() {
  const [oiTimeframe, setOiTimeframe] = useState('1Y')
  const { fundingHeatmap, globalOI, liquidations, isLoading } = useCryptoDashboard()

  // Calculate summary stats
  const latestOI = globalOI?.[globalOI.length - 1]
  const previousOI = globalOI?.[globalOI.length - 2]
  const oiChange = latestOI && previousOI
    ? ((latestOI.global - previousOI.global) / previousOI.global) * 100
    : 0

  // Z-Score calculation for OI
  const calculateOIZScore = () => {
    if (!globalOI || globalOI.length < 30) return []

    return globalOI.map((point, idx) => {
      if (idx < 30) return { date: point.date, zScore: 0 }

      const window = globalOI.slice(idx - 30, idx).map(d => d.global)
      const mean = window.reduce((a, b) => a + b, 0) / window.length
      const stdDev = Math.sqrt(
        window.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / window.length
      )

      return {
        date: point.date,
        zScore: stdDev !== 0 ? (point.global - mean) / stdDev : 0,
      }
    })
  }

  const oiZScore = calculateOIZScore()
  const latestZScore = oiZScore[oiZScore.length - 1]?.zScore || 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-tr-text">Crypto Derivatives</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 skeleton rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-tr-text">Crypto Derivatives</h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Global OI"
          value={formatCompactNumber(latestOI?.global || 0)}
          change={oiChange}
        />
        <StatCard
          label="BTC OI"
          value={formatCompactNumber(latestOI?.btc || 0)}
        />
        <StatCard
          label="ETH OI"
          value={formatCompactNumber(latestOI?.eth || 0)}
        />
        <StatCard
          label="OI Z-Score"
          value={latestZScore.toFixed(2)}
          change={latestZScore}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Liquidations */}
        <Card
          title="Global Liquidations"
          headerRight={
            <TimeframeSelector
              options={['1M', '3M', '1Y']}
              selected={oiTimeframe}
              onChange={setOiTimeframe}
            />
          }
        >
          <LiquidationBarChart data={liquidations || []} height={200} />
          {liquidations && liquidations.length > 0 && (
            <div className="mt-2 text-xs text-tr-muted">
              Max: {formatCompactNumber(
                Math.max(...liquidations.map(d => d.totalLiquidations))
              )}
            </div>
          )}
        </Card>

        {/* Global OI */}
        <Card
          title="Global OI"
          headerRight={
            <TimeframeSelector
              options={['3M', '6M', '1Y']}
              selected={oiTimeframe}
              onChange={setOiTimeframe}
            />
          }
        >
          <StackedAreaChart
            data={globalOI || []}
            areas={[
              { dataKey: 'btc', color: '#f7931a', name: 'BTC' },
              { dataKey: 'eth', color: '#627eea', name: 'ETH' },
              { dataKey: 'others', color: '#8b949e', name: 'Others' },
            ]}
            height={200}
          />
          {latestOI && (
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="text-tr-muted">
                Global: <span className="text-tr-blue">{formatCompactNumber(latestOI.global)}</span>
              </span>
              <span className="text-[#f7931a]">
                BTC: {formatCompactNumber(latestOI.btc)}
              </span>
              <span className="text-[#627eea]">
                ETH: {formatCompactNumber(latestOI.eth)}
              </span>
            </div>
          )}
        </Card>

        {/* Global OI Z-Score */}
        <Card
          title="Global OI Z-Score"
          headerRight={
            <TimeframeSelector
              options={['3M', '6M', '1Y']}
              selected={oiTimeframe}
              onChange={setOiTimeframe}
            />
          }
        >
          <LineChart
            data={oiZScore}
            lines={[{ dataKey: 'zScore', color: '#58a6ff', name: 'Z-Score' }]}
            height={200}
            referenceLines={[
              { y: 2, color: '#3fb950', label: '+2σ' },
              { y: 0, color: '#30363d' },
              { y: -2, color: '#f85149', label: '-2σ' },
            ]}
            yAxisFormatter={(v) => v.toFixed(1)}
          />
          <div className="mt-2 text-xs text-tr-muted">
            Z-Score: <span className={latestZScore > 0 ? 'text-tr-green' : 'text-tr-red'}>
              {latestZScore.toFixed(2)}
            </span>
          </div>
        </Card>
      </div>

      {/* Funding Rate Heatmap */}
      <Card title="Funding Rate Heatmap">
        {fundingHeatmap && (
          <FundingHeatmap data={fundingHeatmap} height={500} />
        )}
      </Card>
    </div>
  )
}
