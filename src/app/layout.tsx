import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trading Dashboard',
  description: 'Professional trading dashboard with real-time market data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-tr-bg text-tr-text min-h-screen">
        {children}
      </body>
    </html>
  )
}
