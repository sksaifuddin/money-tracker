import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from './components/providers/query-provider'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/toaster'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notion Expense Tracker',
  description: 'Track your monthly expenses with data from your Notion database',
  keywords: ['expense tracker', 'notion', 'personal finance', 'budget tracker'],
  authors: [{ name: 'Notion Expense Tracker' }],
  openGraph: {
    title: 'Notion Expense Tracker',
    description: 'Track your monthly expenses with data from your Notion database',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}