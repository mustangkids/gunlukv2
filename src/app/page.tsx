'use client'

import { useState } from 'react'
import { CryptoDashboard } from '@/components/dashboard/CryptoDashboard'
import { OptionsDashboard } from '@/components/dashboard/OptionsDashboard'
import { TraditionalMarkets } from '@/components/dashboard/TraditionalMarkets'
import { COTDashboard } from '@/components/dashboard/COTDashboard'
import { Activity, BarChart3, LineChart, Coins, Menu, X, ExternalLink } from 'lucide-react'
import clsx from 'clsx'

type TabId = 'crypto' | 'options' | 'traditional' | 'cot'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  { id: 'crypto', label: 'Crypto', icon: <Coins className="w-4 h-4" /> },
  { id: 'options', label: 'Options', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'traditional', label: 'Traditional', icon: <LineChart className="w-4 h-4" /> },
  { id: 'cot', label: 'COT', icon: <Activity className="w-4 h-4" /> },
]

export default function TradingDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('crypto')
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH'>('ETH')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-tr-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-tr-bg/95 backdrop-blur border-b border-tr-border">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-tr-blue to-tr-purple rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-tr-text">Trading Dashboard</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-tr-border text-tr-text'
                      : 'text-tr-muted hover:text-tr-text hover:bg-tr-border/50'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              {/* Crypto selector (only show on crypto/options tabs) */}
              {(activeTab === 'crypto' || activeTab === 'options') && (
                <div className="hidden sm:flex items-center gap-1 bg-tr-card border border-tr-border rounded-lg p-1">
                  {(['BTC', 'ETH'] as const).map((crypto) => (
                    <button
                      key={crypto}
                      onClick={() => setSelectedCrypto(crypto)}
                      className={clsx(
                        'px-3 py-1 rounded text-sm font-medium transition-colors',
                        selectedCrypto === crypto
                          ? 'bg-tr-border text-tr-text'
                          : 'text-tr-muted hover:text-tr-text'
                      )}
                    >
                      {crypto}
                    </button>
                  ))}
                </div>
              )}

              {/* Data source link */}
              <a
                href="https://tradingriot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs text-tr-muted hover:text-tr-text transition-colors"
              >
                Inspired by TradingRiot
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-tr-muted hover:text-tr-text"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 pt-3 border-t border-tr-border">
              <div className="flex flex-col gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setMobileMenuOpen(false)
                    }}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-tr-border text-tr-text'
                        : 'text-tr-muted hover:text-tr-text'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 py-6">
        {activeTab === 'crypto' && <CryptoDashboard />}
        {activeTab === 'options' && <OptionsDashboard currency={selectedCrypto} />}
        {activeTab === 'traditional' && <TraditionalMarkets />}
        {activeTab === 'cot' && <COTDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-tr-border mt-8">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-tr-muted">
            <div className="flex items-center gap-4">
              <span>Data Sources:</span>
              <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener noreferrer" className="hover:text-tr-text">
                FRED
              </a>
              <a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer" className="hover:text-tr-text">
                CFTC COT
              </a>
              <a href="https://coinalyze.net" target="_blank" rel="noopener noreferrer" className="hover:text-tr-text">
                Coinalyze
              </a>
              <a href="https://www.deribit.com" target="_blank" rel="noopener noreferrer" className="hover:text-tr-text">
                Deribit
              </a>
            </div>
            <div>
              Built with Next.js, Recharts, and SWR
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
