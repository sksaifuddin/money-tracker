import { Card } from "@/components/ui/card"
import { formatCurrency, formatPercentage, getMonthIconColor } from "@/lib/utils"
import { Calendar, TrendingUp, TrendingDown } from "lucide-react"
import type { MonthlySpending } from "@shared/schema"

interface MonthlyCardProps {
  month: MonthlySpending
  index: number
  onClick: () => void
}

export function MonthlyCard({ month, index, onClick }: MonthlyCardProps) {
  const isIncrease = month.previousMonthComparison >= 0
  
  return (
    <Card 
      className="p-6 cursor-pointer card-hover hover:shadow-card-hover transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">{month.monthName}</h3>
          <p className="text-sm text-neutral-500">{month.year}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getMonthIconColor(index)}`}>
          <Calendar className="h-5 w-5" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-600">Total Spent</span>
          <span className="text-xl font-bold text-neutral-800">
            {formatCurrency(month.totalSpent)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-600">Transactions</span>
          <span className="text-sm font-medium text-neutral-700">
            {month.transactionCount}
          </span>
        </div>
        
        {month.previousMonthComparison !== 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">vs Previous</span>
            <span className={`text-sm font-medium flex items-center ${
              isIncrease ? 'text-destructive' : 'text-success'
            }`}>
              {isIncrease ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatPercentage(Math.abs(month.previousMonthComparison))}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-neutral-500">Relative to highest</span>
          <span className="text-xs text-neutral-600">{month.relativePercentage}%</span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500" 
            style={{ width: `${month.relativePercentage}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
