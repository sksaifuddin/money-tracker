import { useQuery } from "@tanstack/react-query"
import { useLocation } from "wouter"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MonthlyCard } from "@/components/monthly-card"
import { formatCurrency } from "@/lib/utils"
import { RefreshCw, Wallet, AlertCircle } from "lucide-react"
import type { MonthlySpending } from "@shared/schema"

interface MonthlyOverviewResponse {
  months: MonthlySpending[]
  summary: {
    totalMonths: number
    averageMonthly: number
  }
}

export default function Overview() {
  const [, setLocation] = useLocation()
  
  const { data, isLoading, error, refetch, isRefetching } = useQuery<MonthlyOverviewResponse>({
    queryKey: ['/api/transactions/monthly'],
  })

  const handleRefresh = async () => {
    await refetch()
  }

  const handleMonthClick = (month: MonthlySpending) => {
    setLocation(`/month/${month.year}/${month.month}`)
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
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <h1 className="text-2xl font-bold text-neutral-900">Connection Error</h1>
              </div>
              <p className="mt-4 text-sm text-neutral-600 mb-4">
                Failed to connect to Notion. Please check your environment variables:
              </p>
              <ul className="text-sm text-neutral-600 mb-4 list-disc list-inside space-y-1">
                <li>NOTION_INTEGRATION_SECRET</li>
                <li>NOTION_PAGE_URL</li>
              </ul>
              <Button onClick={() => refetch()} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
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
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-neutral-600">Connected to Notion</span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefetching}
                className="text-neutral-500 hover:text-primary"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="animate-fade-in">
          {/* Overview Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-2">Monthly Overview</h2>
                <p className="text-neutral-600">Track your spending patterns across months</p>
              </div>
              
              {/* Summary Stats */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white px-4 py-3 rounded-lg shadow-card">
                  <div className="text-sm text-neutral-500">Total Months</div>
                  <div className="text-lg font-semibold text-neutral-800">
                    {isLoading ? <Skeleton className="h-6 w-8" /> : data?.summary.totalMonths || 0}
                  </div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-card">
                  <div className="text-sm text-neutral-500">Average Monthly</div>
                  <div className="text-lg font-semibold text-neutral-800">
                    {isLoading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      formatCurrency(data?.summary.averageMonthly || 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Skeleton className="h-6 w-20 mb-2" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="w-10 h-10 rounded-lg" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-18" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="flex justify-between items-center mb-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="w-full h-2 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : data?.months.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Transactions Found</h3>
                  <p className="text-neutral-600 mb-4">
                    Make sure you have a 'Transactions' database in your Notion page with transaction data.
                  </p>
                  <Button onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.months.map((month, index) => (
                <MonthlyCard 
                  key={`${month.year}-${month.month}`}
                  month={month}
                  index={index}
                  onClick={() => handleMonthClick(month)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
