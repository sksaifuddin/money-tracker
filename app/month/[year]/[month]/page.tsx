'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { ArrowLeft, Calendar, DollarSign, TrendingUp, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { TransactionTable } from '../../../components/transaction-table'
import type { Transaction, TransactionFilters } from '../../../lib/types'

interface MonthDetailResponse {
  transactions: Transaction[]
  summary: {
    year: number
    month: number
    monthName: string
    totalSpent: number
    transactionCount: number
    averageTransaction: number
    largestTransaction: number
  }
  categories: string[]
}

export default function MonthDetail() {
  const params = useParams()
  const year = params.year as string
  const month = params.month as string
  
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    category: '',
    amountRange: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const buildQueryString = (filters: TransactionFilters) => {
    const searchParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.append(key, value)
    })
    return searchParams.toString()
  }

  const { data, isLoading, error } = useQuery<MonthDetailResponse>({
    queryKey: ['/api/transactions/month', year, month, filters],
    queryFn: async () => {
      const queryString = buildQueryString(filters)
      const url = `/api/transactions/month/${year}/${month}${queryString ? `?${queryString}` : ''}`
      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch month data')
      }
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading transaction details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="max-w-md mx-auto">
            <div className="p-6 text-center">
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Data</h2>
              <p className="text-neutral-600 mb-4">
                {error instanceof Error ? error.message : 'Unable to load transaction data'}
              </p>
              <Link href="/">
                <Button>Return to Overview</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Overview
                </Button>
              </Link>
              <div className="h-6 w-px bg-neutral-300" />
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-neutral-500" />
                <h1 className="text-xl font-semibold text-neutral-800">
                  {data.summary.monthName} {data.summary.year}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Total Spent</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    ${data.summary.totalSpent.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Transactions</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {data.summary.transactionCount}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Average Transaction</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    ${data.summary.averageTransaction.toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">AVG</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Transaction Details
              </h2>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-neutral-500" />
                <Filter className="h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <TransactionTable
              transactions={data.transactions}
              categories={data.categories}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </Card>
      </main>
    </div>
  )
}