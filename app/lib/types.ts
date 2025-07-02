import { z } from "zod"

export interface Transaction {
  notionId: string
  date: string
  description: string
  amount: string
  category: string | null
  paymentMethod: string | null
  merchant: string | null
  notes: string | null
}

export interface MonthlySpending {
  year: number
  month: number
  monthName: string
  totalSpent: number
  transactionCount: number
  averageTransaction: number
  largestTransaction: number
  previousMonthComparison: number
  relativePercentage: number
  transactions: Transaction[]
}

export interface TransactionFilters {
  search?: string
  category?: string
  amountRange?: string
  sortBy?: 'date' | 'amount' | 'description'
  sortOrder?: 'asc' | 'desc'
}