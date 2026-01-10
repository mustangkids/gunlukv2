'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'
import { Maximize2 } from 'lucide-react'

interface CardProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  headerRight?: ReactNode
  onExpand?: () => void
}

export function Card({
  title,
  subtitle,
  children,
  className,
  headerRight,
  onExpand,
}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-tr-card border border-tr-border rounded-lg overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-tr-border">
        <div>
          <h3 className="text-sm font-medium text-tr-text">{title}</h3>
          {subtitle && (
            <p className="text-xs text-tr-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1.5 hover:bg-tr-border rounded transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-tr-muted" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div
      className={clsx(
        'bg-tr-card border border-tr-border rounded-lg p-4',
        className
      )}
    >
      <p className="text-xs text-tr-muted mb-1">{label}</p>
      <p className="text-xl font-semibold text-tr-text">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          <span
            className={clsx(
              'text-sm font-medium',
              isPositive && 'text-tr-green',
              isNegative && 'text-tr-red',
              !isPositive && !isNegative && 'text-tr-muted'
            )}
          >
            {isPositive ? '+' : ''}
            {change.toFixed(2)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-tr-muted">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

interface TimeframeSelectorProps {
  options: string[]
  selected: string
  onChange: (value: string) => void
}

export function TimeframeSelector({
  options,
  selected,
  onChange,
}: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-tr-bg rounded p-0.5">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={clsx(
            'px-2 py-1 text-xs rounded transition-colors',
            selected === option
              ? 'bg-tr-border text-tr-text'
              : 'text-tr-muted hover:text-tr-text'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
