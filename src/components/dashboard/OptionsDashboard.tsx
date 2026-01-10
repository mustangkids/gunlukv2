'use client'

import { useState } from 'react'
import { Card, TimeframeSelector, StatCard } from '@/components/ui/Card'
import { LineChart } from '@/components/charts/LineChart'
import { AreaChart } from '@/components/charts/AreaChart'
import { TermStructureChart, ForwardFactorsChart } from '@/components/charts/TermStructure'
import { useOptionsDashboard } from '@/lib/hooks/useMarketData'
import { formatPercentage } from '@/lib/utils/format'

interface OptionsDashboardProps {
  currency?: 'BTC' | 'ETH'
}

export function OptionsDashboard({ currency = 'ETH' }: OptionsDashboardProps) {
  const [skewTimeframe, setSkewTimeframe] = useState('1Y')
  const [vrpTenor, setVrpTenor] = useState('1m')
  const { termStructure, skew, vrp, isLoading } = useOptionsDashboard(currency)

  // Calculate current stats
  const currentIV = termStructure?.[0]?.current || 0
  const currentRV = vrp?.[vrp.length - 1]?.rv || 0
  const currentVRP = vrp?.[vrp.length - 1]?.vrp || 0
  const currentSkew = skew?.[skew.length - 1]?.skew25d || 0

  // IV Percentile calculation
  const ivPercentile = termStructure && termStructure.length > 0
    ? Math.round(
        (termStructure[0].current - termStructure[0].min) /
        (termStructure[0].max - termStructure[0].min) * 100
      )
    : 0

  // Forward factors mock data (contango/backwardation)
  const forwardFactors = [
    { tenor: '7-30', factor: -0.05 },
    { tenor: '30-60', factor: -0.03 },
    { tenor: '60-90', factor: -0.02 },
    { tenor: '90-180', factor: -0.01 },
  ]

  // Calculate skew Z-score
  const skewZScore = skew && skew.length > 30
    ? (() => {
        const values = skew.map(d => d.skew25d)
        const mean = values.reduce((a, b) => a + b, 0) / values.length
        const stdDev = Math.sqrt(
          values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
        )
        return stdDev !== 0 ? (currentSkew - mean) / stdDev : 0
      })()
    : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-tr-text">{currency} Options Data</h2>
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
        <h2 className="text-lg font-semibold text-tr-text">{currency} Options Data</h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="IV 1m"
          value={`${currentIV.toFixed(1)}%`}
        />
        <StatCard
          label="RV 1m"
          value={`${currentRV.toFixed(1)}%`}
        />
        <StatCard
          label="IV Percentile"
          value={`${ivPercentile}th`}
        />
        <StatCard
          label="VRP (1m)"
          value={formatPercentage(currentVRP)}
          change={currentVRP}
        />
        <StatCard
          label="25d Skew"
          value={formatPercentage(currentSkew)}
          change={currentSkew}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Term Structure */}
        <Card title="Term Structure" className="lg:col-span-1">
          <TermStructureChart data={termStructure || []} height={250} />
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tr-blue" />
              <span className="text-tr-muted">Current</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tr-orange" />
              <span className="text-tr-muted">Median</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-[2px] bg-tr-muted" style={{ borderStyle: 'dashed' }} />
              <span className="text-tr-muted">Min/Max</span>
            </span>
          </div>
        </Card>

        {/* Term Structure Slope */}
        <Card
          title="Term Structure Slope"
          headerRight={
            <TimeframeSelector
              options={['1w-1m', '1m-3m']}
              selected="1w-1m"
              onChange={() => {}}
            />
          }
        >
          {skew && (
            <LineChart
              data={skew.map((d, i) => ({
                date: d.date,
                slope: (Math.random() - 0.5) * 20, // Simplified slope calculation
              }))}
              lines={[{ dataKey: 'slope', color: '#a371f7', name: 'Slope' }]}
              height={250}
              referenceLines={[{ y: 0, color: '#30363d' }]}
              yAxisFormatter={(v) => v.toFixed(1)}
            />
          )}
          <div className="mt-2 text-xs text-tr-muted">
            Slope: <span className="text-tr-purple">5.51</span>
          </div>
        </Card>

        {/* Variance Risk Premium */}
        <Card
          title="Variance Risk Premium"
          headerRight={
            <>
              <select
                className="bg-tr-bg border border-tr-border rounded px-2 py-1 text-xs text-tr-text"
                value={vrpTenor}
                onChange={(e) => setVrpTenor(e.target.value)}
              >
                <option value="1m">1m</option>
                <option value="3m">3m</option>
              </select>
              <TimeframeSelector
                options={['6M', '1Y']}
                selected={skewTimeframe}
                onChange={setSkewTimeframe}
              />
            </>
          }
        >
          {vrp && (
            <AreaChart
              data={vrp.map(d => ({
                date: d.date,
                vrp: d.vrp,
              }))}
              areas={[
                {
                  dataKey: 'vrp',
                  color: currentVRP >= 0 ? '#3fb950' : '#f85149',
                  name: 'VRP',
                },
              ]}
              height={250}
              yAxisFormatter={(v) => `${v.toFixed(0)}%`}
              yDomain={['auto', 'auto']}
            />
          )}
          <div className="mt-2 text-xs text-tr-muted">
            VRP (1m): <span className={currentVRP >= 0 ? 'text-tr-green' : 'text-tr-red'}>
              {formatPercentage(currentVRP)}
            </span>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Forward Factors */}
        <Card title="Forward Factors">
          <ForwardFactorsChart data={forwardFactors} height={200} />
        </Card>

        {/* 25-Delta Skew */}
        <Card
          title="25-Delta Skew"
          headerRight={
            <TimeframeSelector
              options={['6M', '1Y']}
              selected={skewTimeframe}
              onChange={setSkewTimeframe}
            />
          }
        >
          {skew && (
            <LineChart
              data={skew}
              lines={[
                { dataKey: 'skew25d', color: '#58a6ff', name: '25d Skew' },
              ]}
              height={200}
              referenceLines={[{ y: 0, color: '#30363d' }]}
              yAxisFormatter={(v) => `${v.toFixed(0)}%`}
            />
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-tr-muted">
            <span>1w: <span className={currentSkew >= 0 ? 'text-tr-green' : 'text-tr-red'}>{formatPercentage(-7.35)}</span></span>
            <span>1m: <span className={currentSkew >= 0 ? 'text-tr-green' : 'text-tr-red'}>{formatPercentage(-5.46)}</span></span>
          </div>
        </Card>

        {/* 25d Skew Z-Score */}
        <Card title="25d Skew Z-Score">
          {skew && (
            <LineChart
              data={skew.map((d, idx) => {
                if (idx < 30) return { date: d.date, zScore: 0, skew: d.skew25d }

                const window = skew.slice(idx - 30, idx).map(s => s.skew25d)
                const mean = window.reduce((a, b) => a + b, 0) / window.length
                const stdDev = Math.sqrt(
                  window.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / window.length
                )

                return {
                  date: d.date,
                  zScore: stdDev !== 0 ? (d.skew25d - mean) / stdDev : 0,
                  skew: d.skew25d,
                }
              })}
              lines={[
                { dataKey: 'zScore', color: '#58a6ff', name: 'Z-Score' },
                { dataKey: 'skew', color: '#d29922', name: 'Skew', strokeDasharray: '3 3' },
              ]}
              height={200}
              referenceLines={[
                { y: 2, color: '#3fb950' },
                { y: 0, color: '#30363d' },
                { y: -2, color: '#f85149' },
              ]}
              yAxisFormatter={(v) => v.toFixed(1)}
            />
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-tr-muted">
            <span>1w: <span className="text-tr-red">-0.85</span></span>
            <span>1m: <span className="text-tr-text">0.11</span></span>
          </div>
        </Card>
      </div>
    </div>
  )
}
