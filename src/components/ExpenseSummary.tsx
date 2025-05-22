
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useExpenses } from '@/hooks/useExpenses';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { Loader2 } from 'lucide-react';

const ExpenseSummary = () => {
  const { currency, getCurrencySymbol } = useCurrency();
  const currencySymbol = getCurrencySymbol();
  const { expenses, isLoading } = useExpenses();
  const { convertAmount, isLoading: isConverting } = useCurrencyConversion();
  
  const [summary, setSummary] = useState({
    totalAmount: 0,
    monthlyBudget: 2000, // This would ideally come from a budget setting
    topCategory: { name: '', amount: 0 },
    previousMonthPercentage: 0
  });
  const [isCalculating, setIsCalculating] = useState(true);

  // Calculate expense summary with currency conversion
  useEffect(() => {
    async function calculateSummary() {
      if (isLoading || !expenses) {
        return;
      }

      setIsCalculating(true);
      
      try {
        // Get current date for filtering
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        // Filter expenses for current and previous month
        const currentMonthExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
        
        const previousMonthExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousMonthYear;
        });
        
        // Convert all expenses to the selected currency
        const convertedCurrentExpenses = await Promise.all(
          currentMonthExpenses.map(async exp => ({
            ...exp,
            convertedAmount: await convertAmount(exp.amount, exp.currency)
          }))
        );
        
        // Calculate total for current month
        const totalAmount = convertedCurrentExpenses.reduce((sum, exp) => sum + exp.convertedAmount, 0);
        
        // Calculate total for previous month for comparison
        const convertedPreviousExpenses = await Promise.all(
          previousMonthExpenses.map(async exp => ({
            ...exp,
            convertedAmount: await convertAmount(exp.amount, exp.currency)
          }))
        );
        const previousMonthTotal = convertedPreviousExpenses.reduce((sum, exp) => sum + exp.convertedAmount, 0);
        
        // Calculate percentage change
        const previousMonthPercentage = previousMonthTotal > 0 
          ? ((totalAmount - previousMonthTotal) / previousMonthTotal) * 100
          : 0;
        
        // Find top category
        const categoryTotals = convertedCurrentExpenses.reduce((acc, exp) => {
          const { category, convertedAmount } = exp;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += convertedAmount;
          return acc;
        }, {} as Record<string, number>);
        
        let topCategory = { name: 'No expenses', amount: 0 };
        
        Object.entries(categoryTotals).forEach(([category, amount]) => {
          if (amount > topCategory.amount) {
            topCategory = { name: category, amount };
          }
        });
        
        // Budget remaining percentage
        const budgetRemaining = Math.max(0, 100 - (totalAmount / summary.monthlyBudget * 100));
        
        setSummary({
          totalAmount,
          monthlyBudget: summary.monthlyBudget,
          topCategory,
          previousMonthPercentage
        });
      } catch (error) {
        console.error("Error calculating expense summary:", error);
      } finally {
        setIsCalculating(false);
      }
    }
    
    calculateSummary();
  }, [expenses, isLoading, currency, convertAmount]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading || isCalculating ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Calculating...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {currencySymbol}{summary.totalAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.previousMonthPercentage > 0 ? (
                  <span className="text-red-500">+{summary.previousMonthPercentage.toFixed(1)}% from last month</span>
                ) : (
                  <span className="text-green-500">{summary.previousMonthPercentage.toFixed(1)}% from last month</span>
                )}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading || isCalculating ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Calculating...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{currencySymbol}{summary.monthlyBudget.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {Math.max(0, (summary.monthlyBudget - summary.totalAmount) / summary.monthlyBudget * 100).toFixed(1)}% remaining
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading || isCalculating ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Calculating...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{summary.topCategory.name}</div>
              <p className="text-xs text-muted-foreground">
                {currencySymbol}{summary.topCategory.amount.toFixed(2)} this month
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseSummary;
