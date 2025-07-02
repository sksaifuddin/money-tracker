'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from './components/ui/card'
import { Wallet, TrendingDown, AlertCircle } from 'lucide-react'
import { MonthlyCard } from './components/monthly-card'
import type { MonthlySpending } from './lib/types'

interface MonthlyOverviewResponse {
  months: MonthlySpending[]
  summary: {
    totalMonths: number
    averageMonthly: number
  }
}

export default function Overview() {
  const { data, isLoading, error } = useQuery<MonthlyOverviewResponse>({
    queryKey: ['/api/transactions/monthly'],
    queryFn: async () => {
      const response = await fetch('/api/transactions/monthly')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch monthly data')
      }
      return response.json()
    }
  })

  const handleMonthClick = (month: MonthlySpending) => {
    window.location.href = `/month/${month.year}/${month.month}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Wallet className="text-white h-4 w-4" />
                  </div>
                  <h1 className="text-xl font-semibold text-neutral-800">Spending Tracker</h1>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading your spending data...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Wallet className="text-white h-4 w-4" />
                  </div>
                  <h1 className="text-xl font-semibold text-neutral-800">Spending Tracker</h1>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="max-w-md mx-auto">
            <div className="p-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Connection Error</h2>
              <p className="text-neutral-600 mb-4">
                {error instanceof Error ? error.message : 'Unable to load your spending data'}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Wallet className="text-white h-4 w-4" />
                </div>
                <h1 className="text-xl font-semibold text-neutral-800">Spending Tracker</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-neutral-500">Monthly Average</p>
                <p className="text-lg font-semibold text-neutral-900">
                  ${data.summary.averageMonthly.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data.months.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <div className="p-6 text-center">
              <TrendingDown className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">No Data Available</h2>
              <p className="text-neutral-600">
                No spending data found in your Notion database. Make sure your "Expense tracker" database contains transaction records.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Monthly Spending Overview</h2>
              <p className="text-neutral-600">
                {data.summary.totalMonths} months of spending data
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.months.map((month, index) => (
                <MonthlyCard
                  key={`${month.year}-${month.month}`}
                  month={month}
                  index={index}
                  onClick={() => handleMonthClick(month)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}