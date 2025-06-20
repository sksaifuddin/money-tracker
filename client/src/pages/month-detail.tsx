import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation, useRoute } from "wouter"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionTable } from "@/components/transaction-table"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Download, Wallet } from "lucide-react"
import type { Transaction, TransactionFilters } from "@shared/schema"

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
  const [, setLocation] = useLocation()
  const [match, params] = useRoute("/month/:year/:month")
  
  const [filters, setFilters] = useState<TransactionFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const { data, isLoading, error } = useQuery<MonthDetailResponse>({
    queryKey: ['/api/transactions/month', params?.year, params?.month, filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.category) searchParams.append('category', filters.category)
      if (filters.amountRange) searchParams.append('amountRange', filters.amountRange)
      if (filters.sortBy) searchParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) searchParams.append('sortOrder', filters.sortOrder)
      
      const response = await fetch(`/api/transactions/month/${params?.year}/${params?.month}?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch month data')
      return response.json()
    },
    enabled: !!match && !!params?.year && !!params?.month,
  })

  const handleBack = () => {
    setLocation('/')
  }

  const handleExport = () => {
    if (!data?.transactions) return

    const csvData = [
      ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Merchant', 'Notes'],
      ...data.transactions.map(t => [
        t.date,
        t.description,
        t.category || '',
        t.amount,
        t.paymentMethod || '',
        t.merchant || '',
        t.notes || ''
      ])
    ]

    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${data.summary.monthName}-${data.summary.year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!match) {
    return null
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
          <Card className="p-6">
            <CardContent>
              <p className="text-destructive">Failed to load month details. Please try again.</p>
              <Button onClick={handleBack} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Overview
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
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
              
              <nav className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-neutral-500">Overview</span>
                <span className="text-neutral-300">/</span>
                <span className="text-neutral-800">
                  {isLoading ? 'Loading...' : `${data?.summary.monthName} ${data?.summary.year}`}
                </span>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-neutral-600">Connected to Notion</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="animate-slide-up">
          {/* Detail Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="text-neutral-600 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Overview
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={!data?.transactions.length}
                className="text-neutral-600 hover:text-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-neutral-800 mb-2">
                  {isLoading ? <Skeleton className="h-9 w-48" /> : `${data?.summary.monthName} ${data?.summary.year}`}
                </h2>
                <p className="text-neutral-600">Detailed transaction breakdown</p>
              </div>
              
              {/* Month Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-card text-center">
                  <div className="text-2xl font-bold text-neutral-800">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mx-auto" />
                    ) : (
                      formatCurrency(data?.summary.totalSpent || 0)
                    )}
                  </div>
                  <div className="text-sm text-neutral-500">Total Spent</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-card text-center">
                  <div className="text-2xl font-bold text-neutral-800">
                    {isLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : data?.summary.transactionCount || 0}
                  </div>
                  <div className="text-sm text-neutral-500">Transactions</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-card text-center">
                  <div className="text-2xl font-bold text-neutral-800">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mx-auto" />
                    ) : (
                      formatCurrency(data?.summary.averageTransaction || 0)
                    )}
                  </div>
                  <div className="text-sm text-neutral-500">Average</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-card text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mx-auto" />
                    ) : (
                      formatCurrency(data?.summary.largestTransaction || 0)
                    )}
                  </div>
                  <div className="text-sm text-neutral-500">Largest</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <TransactionTable
              transactions={data?.transactions || []}
              categories={data?.categories || []}
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}
        </section>
      </main>
    </div>
  )
}
