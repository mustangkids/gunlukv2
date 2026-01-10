'use client'

import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatChartDate } from '@/lib/utils/format'

interface AreaConfig {
  dataKey: string
  color: string
  name?: string
  fillOpacity?: number
  stackId?: string
}

interface AreaChartProps {
  data: any[]
  areas: AreaConfig[]
  xDataKey?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  yAxisFormatter?: (value: number) => string
  yDomain?: [number | 'auto', number | 'auto']
}

export function AreaChart({
  data,
  areas,
  xDataKey = 'date',
  height = 300,
  showGrid = true,
  showLegend = true,
  yAxisFormatter = (v) => v.toFixed(2),
  yDomain = ['auto', 'auto'],
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient
              key={`gradient-${area.dataKey}`}
              id={`gradient-${area.dataKey}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
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
          domain={yDomain}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '8px 12px',
          }}
          labelStyle={{ color: '#c9d1d9', marginBottom: '4px' }}
          itemStyle={{ color: '#8b949e', padding: '2px 0' }}
          labelFormatter={(label) => formatChartDate(label, 'medium')}
        />
        {showLegend && (
          <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="square" />
        )}
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.color}
            fill={`url(#gradient-${area.dataKey})`}
            strokeWidth={1.5}
            fillOpacity={area.fillOpacity || 1}
            name={area.name || area.dataKey}
            stackId={area.stackId}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

// Stacked area chart for Global OI visualization
interface StackedAreaChartProps {
  data: any[]
  areas: AreaConfig[]
  xDataKey?: string
  height?: number
  yAxisFormatter?: (value: number) => string
}

export function StackedAreaChart({
  data,
  areas,
  xDataKey = 'date',
  height = 300,
  yAxisFormatter = (v) => `$${(v / 1e9).toFixed(1)}B`,
}: StackedAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient
              key={`stack-gradient-${area.dataKey}`}
              id={`stack-gradient-${area.dataKey}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={area.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0.4} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
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
          }}
          labelStyle={{ color: '#c9d1d9' }}
          formatter={(value: number) => [`$${(value / 1e9).toFixed(2)}B`, '']}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="square" />
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stackId="1"
            stroke={area.color}
            fill={`url(#stack-gradient-${area.dataKey})`}
            name={area.name || area.dataKey}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
