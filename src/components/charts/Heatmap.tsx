'use client'

import { useMemo } from 'react'
import { getHeatmapColor, formatChartDate } from '@/lib/utils/format'

interface HeatmapProps {
  data: number[][]
  xLabels: string[]
  yLabels: string[]
  height?: number
  minValue?: number
  maxValue?: number
  showXLabels?: boolean
  showYLabels?: boolean
  cellSize?: number
  tooltipFormatter?: (value: number, x: string, y: string) => string
}

export function Heatmap({
  data,
  xLabels,
  yLabels,
  height = 400,
  minValue = -0.05,
  maxValue = 0.05,
  showXLabels = true,
  showYLabels = true,
  cellSize,
  tooltipFormatter = (v, x, y) => `${y} ${x}: ${(v * 100).toFixed(3)}%`,
}: HeatmapProps) {
  const cellWidth = cellSize || `${100 / xLabels.length}%`
  const cellHeight = cellSize || Math.floor(height / yLabels.length)

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Y-axis labels and grid */}
        <div className="flex">
          {showYLabels && (
            <div className="flex flex-col justify-around pr-2 text-xs text-tr-muted">
              {yLabels.map((label) => (
                <div key={label} style={{ height: cellHeight }} className="flex items-center">
                  {label}
                </div>
              ))}
            </div>
          )}

          {/* Heatmap grid */}
          <div className="flex-1">
            {data.map((row, yIdx) => (
              <div key={yIdx} className="flex" style={{ height: cellHeight }}>
                {row.map((value, xIdx) => (
                  <div
                    key={xIdx}
                    className="heatmap-cell relative group"
                    style={{
                      width: cellWidth,
                      backgroundColor: getHeatmapColor(value, minValue, maxValue),
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute hidden group-hover:block z-10 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-tr-card border border-tr-border rounded text-xs whitespace-nowrap">
                      {tooltipFormatter(value, xLabels[xIdx], yLabels[yIdx])}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        {showXLabels && (
          <div className="flex mt-1" style={{ marginLeft: showYLabels ? '40px' : 0 }}>
            {xLabels.map((label, idx) => (
              <div
                key={idx}
                className="text-xs text-tr-muted text-center"
                style={{ width: cellWidth }}
              >
                {idx % Math.ceil(xLabels.length / 8) === 0 ? formatChartDate(label) : ''}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-tr-muted">
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getHeatmapColor(minValue, minValue, maxValue) }}
            />
            <span>{(minValue * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getHeatmapColor(0, minValue, maxValue) }}
            />
            <span>0%</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getHeatmapColor(maxValue, minValue, maxValue) }}
            />
            <span>+{(maxValue * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Funding Rate Heatmap specifically styled for Trading Riot look
interface FundingHeatmapProps {
  data: {
    dates: string[]
    symbols: string[]
    data: number[][]
  }
  height?: number
}

export function FundingHeatmap({ data, height = 400 }: FundingHeatmapProps) {
  const { dates, symbols, data: heatmapData } = data

  // Transpose data so rows are symbols and columns are dates
  const transposedData = useMemo(() => {
    return symbols.map((_, symbolIdx) =>
      dates.map((_, dateIdx) => heatmapData[dateIdx]?.[symbolIdx] || 0)
    )
  }, [symbols, dates, heatmapData])

  const cellHeight = Math.floor(height / symbols.length)

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Grid */}
        <div className="flex">
          {/* Symbol labels */}
          <div className="flex flex-col w-12 text-xs text-tr-muted">
            {symbols.map((symbol) => (
              <div
                key={symbol}
                style={{ height: cellHeight }}
                className="flex items-center justify-end pr-2 font-mono"
              >
                {symbol}
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          <div className="flex-1">
            {transposedData.map((row, symbolIdx) => (
              <div key={symbolIdx} className="flex" style={{ height: cellHeight }}>
                {row.map((value, dateIdx) => (
                  <div
                    key={dateIdx}
                    className="flex-1 relative group border-r border-b border-tr-bg/50"
                    style={{
                      backgroundColor: getHeatmapColor(value, -0.05, 0.05),
                      minWidth: '2px',
                    }}
                  >
                    <div className="absolute hidden group-hover:block z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-tr-card border border-tr-border rounded text-xs whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{symbols[symbolIdx]}</div>
                      <div>{formatChartDate(dates[dateIdx], 'medium')}</div>
                      <div className={value >= 0 ? 'text-tr-green' : 'text-tr-red'}>
                        {(value * 100).toFixed(4)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Date labels */}
        <div className="flex mt-2 ml-12">
          {dates.map((date, idx) => (
            <div
              key={idx}
              className="flex-1 text-xs text-tr-muted text-center"
              style={{ minWidth: '2px' }}
            >
              {idx % Math.ceil(dates.length / 6) === 0 ? (
                <span className="inline-block -rotate-45 origin-left">
                  {formatChartDate(date)}
                </span>
              ) : (
                ''
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-tr-muted">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-3 rounded"
              style={{ backgroundColor: getHeatmapColor(-0.05, -0.05, 0.05) }}
            />
            <span>-50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-3 rounded"
              style={{ backgroundColor: getHeatmapColor(0, -0.05, 0.05) }}
            />
            <span>0%</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-3 rounded"
              style={{ backgroundColor: getHeatmapColor(0.05, -0.05, 0.05) }}
            />
            <span>+50%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
