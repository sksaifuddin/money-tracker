import React from 'react'
import { Card } from "./ui/card"
import { formatCurrency, formatPercentage, getMonthIconColor } from "../lib/utils"
import { Calendar, TrendingUp, TrendingDown } from "lucide-react"
import type { MonthlySpending } from "../lib/types"

interface MonthlyCardProps {
  month: MonthlySpending
  index: number
  onClick: () => void
}

export function MonthlyCard({ month, index, onClick }: MonthlyCardProps) {
  const iconColor = getMonthIconColor(index)
  const isPositiveTrend = month.previousMonthComparison > 0
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white border border-neutral-200 hover:border-neutral-300"
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
              <Calendar className="text-white h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{month.monthName}</h3>
              <p className="text-sm text-neutral-500">{month.year}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">{month.transactionCount} transactions</p>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-neutral-900">
            {formatCurrency(month.totalSpent)}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Average</span>
            <span className="font-medium text-neutral-700">
              {formatCurrency(month.averageTransaction)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Largest</span>
            <span className="font-medium text-neutral-700">
              {formatCurrency(month.largestTransaction)}
            </span>
          </div>
        </div>

        {/* Previous month comparison */}
        {month.previousMonthComparison !== 0 && (
          <div className="flex items-center space-x-2">
            {isPositiveTrend ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            <span 
              className={`text-sm font-medium ${
                isPositiveTrend ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {formatPercentage(Math.abs(month.previousMonthComparison))} vs last month
            </span>
          </div>
        )}

        {/* Relative spending bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-neutral-500">Relative spending</span>
            <span className="text-xs text-neutral-500">{month.relativePercentage}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${iconColor.replace('bg-', 'bg-').split(' ')[0]}`}
              style={{ width: `${month.relativePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}