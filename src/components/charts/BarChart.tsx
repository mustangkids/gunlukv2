'use client'

import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts'
import { formatChartDate, formatCompactNumber } from '@/lib/utils/format'

interface BarChartProps {
  data: any[]
  dataKey: string
  xDataKey?: string
  height?: number
  showGrid?: boolean
  barColor?: string
  colorByValue?: boolean // Color bars based on positive/negative
  yAxisFormatter?: (value: number) => string
}

export function BarChart({
  data,
  dataKey,
  xDataKey = 'date',
  height = 300,
  showGrid = true,
  barColor = '#58a6ff',
  colorByValue = false,
  yAxisFormatter = (v) => formatCompactNumber(v),
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#30363d"
            vertical={false}
          />
        )}
        <XAxis
          dataKey={xDataKey}
          tickFormatter={(v) => formatChartDate(v)}
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={{ stroke: '#30363d' }}
          tickLine={false}
          minTickGap={50}
        />
        <YAxis
          tickFormatter={yAxisFormatter}
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '8px 12px',
          }}
          labelStyle={{ color: '#c9d1d9' }}
          formatter={(value: number) => [formatCompactNumber(value), '']}
          labelFormatter={(label) => formatChartDate(label, 'medium')}
        />
        {colorByValue && <ReferenceLine y={0} stroke="#30363d" />}
        <Bar dataKey={dataKey} radius={[2, 2, 0, 0]}>
          {colorByValue
            ? data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry[dataKey] >= 0 ? '#3fb950' : '#f85149'}
                />
              ))
            : null}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

// Liquidation bar chart with long/short colors
interface LiquidationBarChartProps {
  data: any[]
  height?: number
}

export function LiquidationBarChart({ data, height = 200 }: LiquidationBarChartProps) {
  // Transform data to show long liquidations as negative (downward)
  const transformedData = data.map((item) => ({
    ...item,
    date: item.timestamp
      ? new Date(item.timestamp).toISOString().split('T')[0]
      : item.date,
    longLiq: -(item.longLiquidations || 0),
    shortLiq: item.shortLiquidations || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={transformedData}
        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        stackOffset="sign"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatChartDate(v)}
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={{ stroke: '#30363d' }}
          tickLine={false}
          minTickGap={50}
        />
        <YAxis
          tickFormatter={(v) => formatCompactNumber(Math.abs(v))}
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
          }}
          labelStyle={{ color: '#c9d1d9' }}
          formatter={(value: number, name: string) => [
            formatCompactNumber(Math.abs(value)),
            name === 'longLiq' ? 'Long Liquidations' : 'Short Liquidations',
          ]}
        />
        <Legend
          formatter={(value) =>
            value === 'longLiq' ? 'Long Liquidations' : 'Short Liquidations'
          }
        />
        <ReferenceLine y={0} stroke="#30363d" />
        <Bar dataKey="longLiq" stackId="stack" fill="#f85149" name="longLiq" />
        <Bar dataKey="shortLiq" stackId="stack" fill="#3fb950" name="shortLiq" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

// Order Book Depth Chart
interface OrderBookChartProps {
  bids: [number, number][]
  asks: [number, number][]
  height?: number
}

export function OrderBookChart({ bids, asks, height = 200 }: OrderBookChartProps) {
  // Calculate cumulative depth
  const bidData = bids
    .sort((a, b) => b[0] - a[0])
    .reduce<{ price: number; cumSize: number }[]>((acc, [price, size]) => {
      const prevCum = acc.length > 0 ? acc[acc.length - 1].cumSize : 0
      acc.push({ price, cumSize: prevCum + size })
      return acc
    }, [])
    .reverse()

  const askData = asks
    .sort((a, b) => a[0] - b[0])
    .reduce<{ price: number; cumSize: number }[]>((acc, [price, size]) => {
      const prevCum = acc.length > 0 ? acc[acc.length - 1].cumSize : 0
      acc.push({ price, cumSize: prevCum + size })
      return acc
    }, [])

  const combined = [
    ...bidData.map((d) => ({ ...d, bid: d.cumSize, ask: 0 })),
    ...askData.map((d) => ({ ...d, bid: 0, ask: d.cumSize })),
  ].sort((a, b) => a.price - b.price)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={combined}>
        <XAxis
          dataKey="price"
          tick={{ fill: '#8b949e', fontSize: 10 }}
          axisLine={{ stroke: '#30363d' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8b949e', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
          }}
        />
        <Bar dataKey="bid" fill="#3fb950" />
        <Bar dataKey="ask" fill="#f85149" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
