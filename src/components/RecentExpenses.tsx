
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useExpenses } from '@/hooks/useExpenses';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Loader2 } from 'lucide-react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface ConvertedExpense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: string;
  convertedAmount: number;
  displayCurrency: string;
}

const RecentExpenses = () => {
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const { expenses, isLoading } = useExpenses();
  const { currency: displayCurrency, getCurrencySymbol } = useCurrency();
  const { convertAmount, isLoading: isConverting } = useCurrencyConversion();
  
  const [convertedExpenses, setConvertedExpenses] = useState<ConvertedExpense[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  
  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'INR', symbol: '₹' },
  ];

  const getCurrencySymbolByCode = (code: string = "USD") => {
    const currencyObj = currencies.find(c => c.code === code);
    return currencyObj ? currencyObj.symbol : getCurrencySymbol();
  };

  // Convert all expenses to the display currency
  useEffect(() => {
    async function convertExpenses() {
      if (!expenses || expenses.length === 0) {
        setConvertedExpenses([]);
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);
      
      try {
        const converted: ConvertedExpense[] = [];
        
        for (const expense of expenses) {
          try {
            const originalAmount = expense.amount || 0;
            const expenseCurrency = expense.currency || 'USD';
            const convertedAmount = await convertAmount(originalAmount, expenseCurrency);
            
            converted.push({
              id: expense.id,
              amount: originalAmount,
              category: expense.category,
              description: expense.description,
              date: expense.date,
              currency: expenseCurrency,
              convertedAmount: convertedAmount || originalAmount,
              displayCurrency
            });
          } catch (error) {
            console.error(`Error converting expense ${expense.id}:`, error);
            // Add expense with original amount if conversion fails
            converted.push({
              id: expense.id,
              amount: expense.amount || 0,
              category: expense.category,
              description: expense.description,
              date: expense.date,
              currency: expense.currency || 'USD',
              convertedAmount: expense.amount || 0,
              displayCurrency
            });
          }
        }
        
        setConvertedExpenses(converted);
      } catch (error) {
        console.error("Error converting expenses:", error);
      } finally {
        setIsProcessing(false);
      }
    }
    
    if (!isLoading) {
      convertExpenses();
    }
  }, [expenses, isLoading, displayCurrency, convertAmount]);

  const filteredExpenses = currencyFilter === "all" 
    ? convertedExpenses 
    : convertedExpenses.filter(expense => expense.currency === currencyFilter);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-textDark">Recent Expenses</h2>
        <div className="flex items-center">
          <Label htmlFor="currency-filter" className="mr-2 text-sm">Currency:</Label>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger id="currency-filter" className="w-[130px]">
              <SelectValue placeholder="All Currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {currencies.map(currency => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative overflow-x-auto">
        {isLoading || isProcessing ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Original</TableHead>
                <TableHead className="text-right">In {displayCurrency}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No expenses found in this currency
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">
                      {getCurrencySymbolByCode(expense.currency)}{expense.amount.toFixed(2)} 
                      <span className="text-xs text-muted-foreground ml-1">{expense.currency}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {getCurrencySymbolByCode(displayCurrency)}{expense.convertedAmount.toFixed(2)} 
                      <span className="text-xs text-muted-foreground ml-1">{displayCurrency}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default RecentExpenses;
