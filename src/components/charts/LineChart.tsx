'use client'

import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { formatChartDate, formatCompactNumber } from '@/lib/utils/format'

interface LineConfig {
  dataKey: string
  color: string
  name?: string
  strokeWidth?: number
  dot?: boolean
  strokeDasharray?: string
}

interface LineChartProps {
  data: any[]
  lines: LineConfig[]
  xDataKey?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  yAxisFormatter?: (value: number) => string
  referenceLines?: { y: number; color: string; label?: string }[]
  yDomain?: [number | 'auto', number | 'auto']
}

export function LineChart({
  data,
  lines,
  xDataKey = 'date',
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  yAxisFormatter = (v) => v.toFixed(2),
  referenceLines = [],
  yDomain = ['auto', 'auto'],
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
        {showTooltip && (
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
        )}
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
            iconSize={10}
          />
        )}
        {referenceLines.map((ref, idx) => (
          <ReferenceLine
            key={idx}
            y={ref.y}
            stroke={ref.color}
            strokeDasharray="3 3"
            label={ref.label ? { value: ref.label, fill: '#8b949e', fontSize: 10 } : undefined}
          />
        ))}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={line.strokeWidth || 1.5}
            dot={line.dot || false}
            name={line.name || line.dataKey}
            strokeDasharray={line.strokeDasharray}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

// Dual axis line chart for comparing two metrics
interface DualAxisLineChartProps {
  data: any[]
  leftLine: LineConfig & { yAxisFormatter?: (v: number) => string }
  rightLine: LineConfig & { yAxisFormatter?: (v: number) => string }
  xDataKey?: string
  height?: number
}

export function DualAxisLineChart({
  data,
  leftLine,
  rightLine,
  xDataKey = 'date',
  height = 300,
}: DualAxisLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 50, left: 0, bottom: 5 }}>
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
          yAxisId="left"
          tickFormatter={leftLine.yAxisFormatter || ((v) => v.toFixed(2))}
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={rightLine.yAxisFormatter || ((v) => v.toFixed(2))}
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
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey={leftLine.dataKey}
          stroke={leftLine.color}
          strokeWidth={leftLine.strokeWidth || 1.5}
          dot={false}
          name={leftLine.name || leftLine.dataKey}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey={rightLine.dataKey}
          stroke={rightLine.color}
          strokeWidth={rightLine.strokeWidth || 1.5}
          dot={false}
          name={rightLine.name || rightLine.dataKey}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
