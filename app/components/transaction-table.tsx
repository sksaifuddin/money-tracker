import React, { useState } from 'react'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatCurrency, formatDate, getCategoryColor } from '../lib/utils'
import type { Transaction, TransactionFilters } from '../lib/types'

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
  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleSortChange = (sortBy: 'date' | 'amount' | 'description') => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc'
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder: newSortOrder
    })
  }

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return filters.sortOrder === 'desc' ? 
      <ArrowDown className="h-4 w-4" /> : 
      <ArrowUp className="h-4 w-4" />
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      amountRange: '',
      sortBy: 'date',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = filters.search || filters.category || filters.amountRange

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search transactions..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select 
          value={filters.category || ''} 
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.amountRange || ''} 
          onValueChange={(value) => handleFilterChange('amountRange', value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Amount Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Amounts</SelectItem>
            <SelectItem value="0-25">$0 - $25</SelectItem>
            <SelectItem value="25-100">$25 - $100</SelectItem>
            <SelectItem value="100-500">$100 - $500</SelectItem>
            <SelectItem value="500+">$500+</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-neutral-600">
        Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSortChange('date')}
                  className="h-auto p-0 font-medium"
                >
                  Date
                  {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSortChange('description')}
                  className="h-auto p-0 font-medium"
                >
                  Description
                  {getSortIcon('description')}
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSortChange('amount')}
                  className="h-auto p-0 font-medium"
                >
                  Amount
                  {getSortIcon('amount')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                  No transactions found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.notionId}>
                  <TableCell className="font-medium">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.notes && (
                        <div className="text-sm text-neutral-500 mt-1">
                          {transaction.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.category ? (
                      <Badge 
                        variant="secondary" 
                        className={getCategoryColor(transaction.category)}
                      >
                        {transaction.category}
                      </Badge>
                    ) : (
                      <span className="text-neutral-400">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.merchant || (
                      <span className="text-neutral-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.paymentMethod || (
                      <span className="text-neutral-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(parseFloat(transaction.amount))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}