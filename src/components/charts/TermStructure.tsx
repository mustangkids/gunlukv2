'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { TermStructurePoint } from '@/types'

interface TermStructureChartProps {
  data: TermStructurePoint[]
  height?: number
  showRange?: boolean
}

export function TermStructureChart({
  data,
  height = 300,
  showRange = true,
}: TermStructureChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="ivRange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#58a6ff" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
        <XAxis
          dataKey="tenor"
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={{ stroke: '#30363d' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
          width={40}
          tickFormatter={(v) => `${v.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '8px 12px',
          }}
          labelStyle={{ color: '#c9d1d9', marginBottom: '4px' }}
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)}%`,
            name,
          ]}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="line" />

        {showRange && (
          <>
            {/* Min-Max Range as area */}
            <Area
              dataKey="max"
              type="monotone"
              stroke="none"
              fill="transparent"
              name="Max"
              legendType="none"
            />
            <Area
              dataKey="min"
              type="monotone"
              stroke="#8b949e"
              strokeDasharray="3 3"
              fill="none"
              name="Min"
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="max"
              stroke="#8b949e"
              strokeDasharray="3 3"
              dot={false}
              name="Max"
              strokeWidth={1}
            />

            {/* 25th-75th Percentile */}
            <Line
              type="monotone"
              dataKey="percentile25"
              stroke="#58a6ff"
              strokeDasharray="2 2"
              dot={false}
              name="25th %"
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="percentile75"
              stroke="#a371f7"
              strokeDasharray="2 2"
              dot={false}
              name="75th %"
              strokeWidth={1}
            />

            {/* Median */}
            <Line
              type="monotone"
              dataKey="median"
              stroke="#d29922"
              dot={false}
              name="Median"
              strokeWidth={1.5}
            />
          </>
        )}

        {/* Current IV - main line */}
        <Line
          type="monotone"
          dataKey="current"
          stroke="#58a6ff"
          strokeWidth={2}
          dot={{ r: 3, fill: '#58a6ff' }}
          activeDot={{ r: 5, fill: '#58a6ff' }}
          name="Current"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// VIX Term Structure Chart
interface VIXTermStructureChartProps {
  data: { tenor: string; value: number }[]
  height?: number
}

export function VIXTermStructureChart({
  data,
  height = 200,
}: VIXTermStructureChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="vixGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d29922" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#d29922" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
        <XAxis
          dataKey="tenor"
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={{ stroke: '#30363d' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
          }}
          labelStyle={{ color: '#c9d1d9' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#d29922"
          fill="url(#vixGradient)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#d29922"
          strokeWidth={2}
          dot={{ r: 3, fill: '#d29922' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// Forward Factors Bar Chart (for options dashboard)
interface ForwardFactorsProps {
  data: { tenor: string; factor: number }[]
  height?: number
}

export function ForwardFactorsChart({ data, height = 200 }: ForwardFactorsProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
        <XAxis
          dataKey="tenor"
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={{ stroke: '#30363d' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 0]}
          width={50}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Factor']}
        />
        {/* Reference line at 0 */}
        <Area
          type="monotone"
          dataKey="factor"
          fill="#58a6ff"
          stroke="#58a6ff"
          strokeWidth={0}
          fillOpacity={0.8}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
