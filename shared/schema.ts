import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  notionId: text("notion_id").notNull().unique(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category"),
  paymentMethod: text("payment_method"),
  merchant: text("merchant"),
  notes: text("notes"),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Monthly summary type for aggregated data
export type MonthlySpending = {
  year: number;
  month: number;
  monthName: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  largestTransaction: number;
  previousMonthComparison: number;
  relativePercentage: number;
  transactions: Transaction[];
};

export type TransactionFilters = {
  search?: string;
  category?: string;
  amountRange?: string;
  sortBy?: 'date' | 'amount' | 'description';
  sortOrder?: 'asc' | 'desc';
};
