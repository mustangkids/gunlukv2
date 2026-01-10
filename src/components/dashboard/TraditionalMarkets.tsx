'use client'

import { useState } from 'react'
import { Card, TimeframeSelector, StatCard } from '@/components/ui/Card'
import { LineChart, DualAxisLineChart } from '@/components/charts/LineChart'
import { AreaChart } from '@/components/charts/AreaChart'
import { BarChart } from '@/components/charts/BarChart'
import { VIXTermStructureChart } from '@/components/charts/TermStructure'
import { useTraditionalMarkets } from '@/lib/hooks/useMarketData'
import { formatPercentage, calculateYDomain } from '@/lib/utils/format'
import { calculateZScore, calculatePercentile } from '@/lib/api/fred'

export function TraditionalMarkets() {
  const [timeframe, setTimeframe] = useState('1Y')
  const { vix, credit, sp500, isLoading } = useTraditionalMarkets('2020-01-01')

  // Calculate current values
  const currentVIX = vix?.[vix.length - 1]?.vix || 0
  const currentSPX = sp500?.[sp500.length - 1]?.value || 0
  const currentHY = credit?.[credit.length - 1]?.hy || 0
  const currentIG = credit?.[credit.length - 1]?.ig || 0
  const currentSpread = credit?.[credit.length - 1]?.spread || 0

  // Calculate VIX Z-Score
  const vixWithZScore = vix
    ? calculateZScore(vix.map(d => ({ date: d.date, value: d.vix })), 252)
    : []
  const currentVIXZScore = vixWithZScore[vixWithZScore.length - 1]?.zScore || 0

  // Calculate VIX Percentile
  const vixPercentile = vix
    ? calculatePercentile(currentVIX, vix.map(d => d.vix))
    : 0

  // Credit Z-Score
  const creditWithZScore = credit
    ? calculateZScore(credit.map(d => ({ date: d.date, value: d.spread })), 252)
    : []
  const currentCreditZScore = creditWithZScore[creditWithZScore.length - 1]?.zScore || 0

  // Credit Percentile
  const creditPercentile = credit
    ? calculatePercentile(currentSpread, credit.map(d => d.spread))
    : 0

  // Mock VIX term structure data
  const vixTermStructure = [
    { tenor: '9d', value: 14.5 },
    { tenor: '30d', value: 15.2 },
    { tenor: '60d', value: 16.8 },
    { tenor: '90d', value: 17.5 },
    { tenor: '180d', value: 19.2 },
  ]

  // SPX Composite Regime (simplified calculation)
  const spxRegime = sp500?.map((d, idx) => {
    if (idx < 50) return { date: d.date, spx: d.value, composite: 0 }

    const window = sp500.slice(idx - 50, idx)
    const returns = window.map((p, i) =>
      i > 0 ? (p.value - window[i - 1].value) / window[i - 1].value : 0
    )
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length

    return {
      date: d.date,
      spx: d.value,
      composite: avgReturn * 100,
    }
  }) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-tr-text">Traditional Markets</h2>
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
      {/* Section Header with SPX Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-tr-text">Traditional Markets</h2>
          <span className="text-2xl font-bold text-tr-text">
            SPX {currentSPX.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-sm text-tr-green">+0.01%</span>
        </div>
      </div>

      {/* SPX Composite Regime */}
      <Card
        title="SPX Composite Regime"
        subtitle={`SPX: ${currentSPX.toLocaleString()} | Composite: ${spxRegime[spxRegime.length - 1]?.composite.toFixed(3) || 0} | Percentile: 48%`}
        headerRight={
          <TimeframeSelector
            options={['1Y', '3Y', '5Y']}
            selected={timeframe}
            onChange={setTimeframe}
          />
        }
      >
        <div className="h-[300px]">
          <DualAxisLineChart
            data={spxRegime}
            leftLine={{
              dataKey: 'spx',
              color: '#c9d1d9',
              name: 'SPX',
              yAxisFormatter: (v) => v.toLocaleString(),
            }}
            rightLine={{
              dataKey: 'composite',
              color: '#3fb950',
              name: 'Composite',
              yAxisFormatter: (v) => v.toFixed(2),
            }}
            height={250}
          />
        </div>
        {/* Composite regime bar */}
        <div className="mt-4">
          <BarChart
            data={spxRegime.slice(-100).map(d => ({
              date: d.date,
              value: d.composite,
            }))}
            dataKey="value"
            colorByValue={true}
            height={60}
            showGrid={false}
          />
        </div>
      </Card>

      {/* VIX Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <h3 className="col-span-full text-md font-medium text-tr-muted">VIX</h3>

        {/* VIX Regime */}
        <Card
          title="Regime"
          headerRight={
            <TimeframeSelector
              options={['6M', '1Y']}
              selected={timeframe}
              onChange={setTimeframe}
            />
          }
        >
          {vix && (
            <LineChart
              data={vix.map(d => ({
                date: d.date,
                vix: d.vix,
                ma20: 0, // Would calculate moving average
              }))}
              lines={[
                { dataKey: 'vix', color: '#c9d1d9', name: 'VIX' },
              ]}
              height={200}
              yAxisFormatter={(v) => v.toFixed(0)}
            />
          )}
          <div className="mt-2 text-xs text-tr-muted">
            Current: <span className="text-tr-text">{currentVIX.toFixed(2)}</span>
            {' | '}
            VIX: <span className="text-tr-text">{currentVIX.toFixed(2)}</span>
          </div>
        </Card>

        {/* VIX Z-Score */}
        <Card
          title="Z-Score"
          headerRight={
            <TimeframeSelector
              options={['6M', '1Y']}
              selected={timeframe}
              onChange={setTimeframe}
            />
          }
        >
          <LineChart
            data={vixWithZScore.map(d => ({ date: d.date, zScore: d.zScore || 0 }))}
            lines={[{ dataKey: 'zScore', color: '#58a6ff', name: 'Z-Score' }]}
            height={200}
            referenceLines={[
              { y: 2, color: '#3fb950' },
              { y: 0, color: '#30363d' },
              { y: -2, color: '#f85149' },
            ]}
            yAxisFormatter={(v) => v.toFixed(1)}
          />
          <div className="mt-2 text-xs text-tr-muted">
            Z-Score: <span className="text-tr-blue">{currentVIXZScore.toFixed(2)}</span>
            {' | '}
            Percentile: <span className="text-tr-text">{vixPercentile.toFixed(0)}%</span>
          </div>
        </Card>

        {/* VIX Term Structure */}
        <Card title="Term Structure">
          <VIXTermStructureChart data={vixTermStructure} height={200} />
          <div className="mt-2 text-xs text-tr-muted">
            IV Percentile: <span className="text-tr-text">21st</span>
          </div>
        </Card>
      </div>

      {/* Credit Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <h3 className="col-span-full text-md font-medium text-tr-muted">Credit</h3>

        {/* Credit Regime */}
        <Card
          title="Regime"
          headerRight={
            <TimeframeSelector
              options={['1Y', '3Y', '5Y']}
              selected={timeframe}
              onChange={setTimeframe}
            />
          }
        >
          {credit && (
            <LineChart
              data={credit.map(d => ({
                date: d.date,
                hy: d.hy,
                ig: d.ig,
              }))}
              lines={[
                { dataKey: 'hy', color: '#c9d1d9', name: 'HY' },
                { dataKey: 'ig', color: '#d29922', name: 'IG' },
              ]}
              height={200}
              yAxisFormatter={(v) => v.toFixed(1)}
            />
          )}
          <div className="mt-2 text-xs text-tr-muted">
            Current: <span className="text-tr-text">{currentSpread.toFixed(2)}</span>
            {' | '}
            HY: <span className="text-tr-text">{currentHY.toFixed(2)}</span>
            {' | '}
            IG: <span className="text-tr-text">{currentIG.toFixed(2)}</span>
          </div>
        </Card>

        {/* Credit Z-Score */}
        <Card
          title="Z-Score"
          headerRight={
            <TimeframeSelector
              options={['1Y', '3Y', '5Y']}
              selected={timeframe}
              onChange={setTimeframe}
            />
          }
        >
          <LineChart
            data={creditWithZScore.map(d => ({ date: d.date, zScore: d.zScore || 0 }))}
            lines={[{ dataKey: 'zScore', color: '#58a6ff', name: 'Z-Score' }]}
            height={200}
            referenceLines={[
              { y: 2, color: '#f85149' },
              { y: 0, color: '#30363d' },
              { y: -2, color: '#3fb950' },
            ]}
            yAxisFormatter={(v) => v.toFixed(1)}
          />
          <div className="mt-2 text-xs text-tr-muted">
            Z-Score: <span className="text-tr-blue">{currentCreditZScore.toFixed(2)}</span>
            {' | '}
            Percentile: <span className="text-tr-text">{creditPercentile.toFixed(0)}%</span>
          </div>
        </Card>

        {/* Credit Spread */}
        <Card
          title="Spread"
          headerRight={
            <TimeframeSelector
              options={['1Y', '3Y', '5Y']}
              selected={timeframe}
              onChange={setTimeframe}
            />
          }
        >
          {credit && (
            <BarChart
              data={credit.map(d => ({
                date: d.date,
                spread: d.spread,
              }))}
              dataKey="spread"
              colorByValue={true}
              height={200}
              yAxisFormatter={(v) => v.toFixed(0)}
            />
          )}
          <div className="mt-2 text-xs text-tr-muted">
            Spread: <span className={currentSpread >= 0 ? 'text-tr-green' : 'text-tr-red'}>
              {currentSpread.toFixed(2)}
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
