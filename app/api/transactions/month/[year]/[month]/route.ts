import { NextRequest, NextResponse } from 'next/server'
import { findDatabaseByTitle, getTransactionsFromNotion } from '../../../../../lib/notion'
import { format, parseISO } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const { year, month } = params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const amountRange = searchParams.get('amountRange');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const expenseDb = await findDatabaseByTitle("Expense tracker");
    if (!expenseDb) {
      return NextResponse.json({ message: "Expense tracker database not found" }, { status: 404 });
    }

    const allTransactions = await getTransactionsFromNotion(expenseDb.id);
    
    // Filter transactions for the specific month
    let monthTransactions = allTransactions.filter(transaction => {
      const date = parseISO(transaction.date);
      return date.getFullYear() === parseInt(year) && (date.getMonth() + 1) === parseInt(month);
    });

    // Apply filters
    if (search) {
      const searchTerm = search.toLowerCase();
      monthTransactions = monthTransactions.filter(t => 
        t.description.toLowerCase().includes(searchTerm) ||
        t.merchant?.toLowerCase().includes(searchTerm) ||
        t.category?.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      monthTransactions = monthTransactions.filter(t => 
        t.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (amountRange) {
      monthTransactions = monthTransactions.filter(t => {
        const amount = parseFloat(t.amount);
        switch (amountRange) {
          case '0-25': return amount >= 0 && amount <= 25;
          case '25-100': return amount > 25 && amount <= 100;
          case '100-500': return amount > 100 && amount <= 500;
          case '500+': return amount > 500;
          default: return true;
        }
      });
    }

    // Sort transactions
    monthTransactions.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = parseFloat(a.amount) - parseFloat(b.amount);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Calculate month summary
    const totalSpent = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const averageTransaction = monthTransactions.length > 0 ? totalSpent / monthTransactions.length : 0;
    const largestTransaction = monthTransactions.length > 0 
      ? Math.max(...monthTransactions.map(t => parseFloat(t.amount))) 
      : 0;

    return NextResponse.json({
      transactions: monthTransactions,
      summary: {
        year: parseInt(year),
        month: parseInt(month),
        monthName: format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM'),
        totalSpent: Math.round(totalSpent * 100) / 100,
        transactionCount: monthTransactions.length,
        averageTransaction: Math.round(averageTransaction * 100) / 100,
        largestTransaction: Math.round(largestTransaction * 100) / 100
      },
      categories: Array.from(new Set(allTransactions.map(t => t.category).filter(Boolean)))
    });
  } catch (error) {
    console.error("Error fetching month transactions:", error);
    return NextResponse.json({ message: "Failed to fetch month transactions" }, { status: 500 });
  }
}