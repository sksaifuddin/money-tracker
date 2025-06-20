import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'food & dining': 'bg-success/10 text-success',
    'food': 'bg-success/10 text-success',
    'dining': 'bg-success/10 text-success',
    'entertainment': 'bg-secondary/10 text-secondary',
    'shopping': 'bg-primary/10 text-primary',
    'transportation': 'bg-warning/10 text-warning',
    'transport': 'bg-warning/10 text-warning',
    'utilities': 'bg-neutral-200 text-neutral-700',
    'healthcare': 'bg-red-100 text-red-700',
    'education': 'bg-purple-100 text-purple-700',
    'travel': 'bg-blue-100 text-blue-700',
  }
  
  const lowerCategory = category?.toLowerCase() || ''
  return colors[lowerCategory] || 'bg-neutral-200 text-neutral-700'
}

export function getMonthIconColor(index: number): string {
  const colors = [
    'bg-primary/10 text-primary',
    'bg-secondary/10 text-secondary', 
    'bg-warning/10 text-warning',
    'bg-success/10 text-success',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
  ]
  return colors[index % colors.length]
}
