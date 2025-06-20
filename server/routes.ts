import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { notion, getTransactionsFromNotion, findDatabaseByTitle } from "./notion";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all transactions grouped by month
  app.get("/api/transactions/monthly", async (req, res) => {
    try {
      console.log("Fetching transactions from Notion...");
      
      // Find the transactions database
      const transactionsDb = await findDatabaseByTitle("Transactions");
      if (!transactionsDb) {
        return res.status(404).json({ 
          message: "Transactions database not found. Please ensure you have a 'Transactions' database in your Notion page." 
        });
      }

      const transactions = await getTransactionsFromNotion(transactionsDb.id);
      
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
      const monthlyArray = Array.from(monthlyData.values()).map((month, index, array) => {
        const averageTransaction = month.totalSpent / month.transactionCount || 0;
        const largestTransaction = Math.max(...month.amounts, 0);
        
        // Find previous month for comparison
        const currentDate = new Date(month.year, month.month - 1);
        const previousMonth = array.find(m => {
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

      res.json({
        months: monthlyArray,
        summary: {
          totalMonths,
          averageMonthly
        }
      });
    } catch (error) {
      console.error("Error fetching monthly transactions:", error);
      res.status(500).json({ 
        message: "Failed to fetch transactions from Notion. Please check your NOTION_INTEGRATION_SECRET and NOTION_PAGE_URL environment variables." 
      });
    }
  });

  // Get detailed transactions for a specific month
  app.get("/api/transactions/month/:year/:month", async (req, res) => {
    try {
      const { year, month } = req.params;
      const { search, category, amountRange, sortBy = 'date', sortOrder = 'desc' } = req.query;

      const transactionsDb = await findDatabaseByTitle("Transactions");
      if (!transactionsDb) {
        return res.status(404).json({ message: "Transactions database not found" });
      }

      const allTransactions = await getTransactionsFromNotion(transactionsDb.id);
      
      // Filter transactions for the specific month
      let monthTransactions = allTransactions.filter(transaction => {
        const date = parseISO(transaction.date);
        return date.getFullYear() === parseInt(year) && (date.getMonth() + 1) === parseInt(month);
      });

      // Apply filters
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        monthTransactions = monthTransactions.filter(t => 
          t.description.toLowerCase().includes(searchTerm) ||
          t.merchant?.toLowerCase().includes(searchTerm) ||
          t.category?.toLowerCase().includes(searchTerm)
        );
      }

      if (category) {
        monthTransactions = monthTransactions.filter(t => 
          t.category?.toLowerCase() === category.toString().toLowerCase()
        );
      }

      if (amountRange) {
        const range = amountRange.toString();
        monthTransactions = monthTransactions.filter(t => {
          const amount = parseFloat(t.amount);
          switch (range) {
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

      res.json({
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
      res.status(500).json({ message: "Failed to fetch month transactions" });
    }
  });

  // Refresh transactions from Notion
  app.post("/api/transactions/refresh", async (req, res) => {
    try {
      const transactionsDb = await findDatabaseByTitle("Transactions");
      if (!transactionsDb) {
        return res.status(404).json({ message: "Transactions database not found" });
      }

      const transactions = await getTransactionsFromNotion(transactionsDb.id);
      res.json({ 
        message: "Transactions refreshed successfully", 
        count: transactions.length 
      });
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      res.status(500).json({ message: "Failed to refresh transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
