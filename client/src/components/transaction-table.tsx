import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { formatCurrency, formatDate, getCategoryColor } from "@/lib/utils"
import type { Transaction, TransactionFilters } from "@shared/schema"

interface TransactionTableProps {
  transactions: Transaction[]
  categories: string[]
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
}

export function TransactionTable({ 
  transactions, 
  categories, 
  filters, 
  onFiltersChange 
}: TransactionTableProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value === 'all' ? undefined : value })
  }

  const handleAmountRangeChange = (value: string) => {
    onFiltersChange({ ...filters, amountRange: value === 'all' ? undefined : value })
  }

  const handleSort = (column: 'date' | 'amount' | 'description') => {
    const newOrder = filters.sortBy === column && filters.sortOrder === 'desc' ? 'asc' : 'desc'
    onFiltersChange({ ...filters, sortBy: column, sortOrder: newOrder })
  }

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) return <ArrowUpDown className="h-4 w-4" />
    return filters.sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Details</CardTitle>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="lg:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.amountRange || 'all'} onValueChange={handleAmountRangeChange}>
            <SelectTrigger className="lg:w-48">
              <SelectValue placeholder="Any Amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Amount</SelectItem>
              <SelectItem value="0-25">$0 - $25</SelectItem>
              <SelectItem value="25-100">$25 - $100</SelectItem>
              <SelectItem value="100-500">$100 - $500</SelectItem>
              <SelectItem value="500+">$500+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('date')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Date {getSortIcon('date')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('description')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Description {getSortIcon('description')}
                  </Button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('amount')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Amount {getSortIcon('amount')}
                  </Button>
                </TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.notionId} className="hover:bg-neutral-50">
                  <TableCell className="text-neutral-600">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    {transaction.category && (
                      <Badge className={getCategoryColor(transaction.category)}>
                        {transaction.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(parseFloat(transaction.amount))}
                  </TableCell>
                  <TableCell className="text-neutral-600">
                    {transaction.paymentMethod || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {transactions.map((transaction) => (
            <div key={transaction.notionId} className="bg-neutral-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-800">{transaction.description}</h4>
                  <p className="text-sm text-neutral-500">{formatDate(transaction.date)}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-800">
                    {formatCurrency(parseFloat(transaction.amount))}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {transaction.paymentMethod || '-'}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                {transaction.category && (
                  <Badge className={getCategoryColor(transaction.category)}>
                    {transaction.category}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {transactions.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No transactions found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
