import { NextResponse } from 'next/server'
import { findDatabaseByTitle, getTransactionsFromNotion } from '../../../lib/notion'
import { format, parseISO, subMonths } from 'date-fns'

export async function GET() {
  try {
    console.log("Fetching transactions from Notion...");
    
    // Find the expense tracker database
    const expenseDb = await findDatabaseByTitle("Expense tracker");
    if (!expenseDb) {
      return NextResponse.json({ 
        message: "Expense tracker database not found. Please ensure you have an 'Expense tracker' database in your Notion page." 
      }, { status: 404 });
    }

    const transactions = await getTransactionsFromNotion(expenseDb.id as string);
    
    // Group transactions by month
    const monthlyData = new Map();
    
    transactions.forEach(transaction => {
      const date = parseISO(transaction.date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          monthName: format(date, 'MMMM'),
          totalSpent: 0,
          transactionCount: 0,
          transactions: [],
          amounts: []
        });
      }
      
      const monthData = monthlyData.get(monthKey);
      monthData.totalSpent += parseFloat(transaction.amount);
      monthData.transactionCount += 1;
      monthData.transactions.push(transaction);
      monthData.amounts.push(parseFloat(transaction.amount));
    });

    // Calculate additional metrics and sort
    const monthlyArray = Array.from(monthlyData.values()).map((month: any, index, array) => {
      const averageTransaction = month.totalSpent / month.transactionCount || 0;
      const largestTransaction = Math.max(...month.amounts, 0);
      
      // Find previous month for comparison
      const currentDate = new Date(month.year, month.month - 1);
      const previousMonth = array.find((m: any) => {
        const prevDate = new Date(m.year, m.month - 1);
        return prevDate.getTime() === subMonths(currentDate, 1).getTime();
      });
      
      const previousMonthComparison = previousMonth 
        ? ((month.totalSpent - previousMonth.totalSpent) / previousMonth.totalSpent) * 100
        : 0;

      return {
        ...month,
        averageTransaction: Math.round(averageTransaction * 100) / 100,
        largestTransaction: Math.round(largestTransaction * 100) / 100,
        previousMonthComparison: Math.round(previousMonthComparison * 10) / 10,
        totalSpent: Math.round(month.totalSpent * 100) / 100
      };
    });

    // Calculate relative percentages
    const maxSpending = Math.max(...monthlyArray.map(m => m.totalSpent));
    monthlyArray.forEach(month => {
      month.relativePercentage = Math.round((month.totalSpent / maxSpending) * 100);
    });

    // Sort by date (most recent first)
    monthlyArray.sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1);
      const dateB = new Date(b.year, b.month - 1);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate summary stats
    const totalMonths = monthlyArray.length;
    const averageMonthly = totalMonths > 0 
      ? Math.round((monthlyArray.reduce((sum, m) => sum + m.totalSpent, 0) / totalMonths) * 100) / 100
      : 0;

    return NextResponse.json({
      months: monthlyArray,
      summary: {
        totalMonths,
        averageMonthly
      }
    });
  } catch (error) {
    console.error("Error fetching monthly transactions:", error);
    return NextResponse.json({ 
      message: "Failed to fetch transactions from Notion. Please check your NOTION_INTEGRATION_SECRET and NOTION_PAGE_URL environment variables." 
    }, { status: 500 });
  }
}