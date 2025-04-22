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

interface Expense {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  currency?: string;
}

const RecentExpenses = () => {
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  useEffect(() => {
    const loadExpenses = () => {
      const storedExpenses = localStorage.getItem('expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    };

    loadExpenses();
    // Listen for storage events to update the list when new expenses are added
    window.addEventListener('storage', loadExpenses);
    return () => window.removeEventListener('storage', loadExpenses);
  }, []);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'INR', symbol: '₹' },
  ];

  const getCurrencySymbol = (code: string = "USD") => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '$';
  };

  const filteredExpenses = currencyFilter === "all" 
    ? expenses 
    : expenses.filter(expense => expense.currency === currencyFilter);

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
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
                    {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)} 
                    {expense.currency && <span className="text-xs text-muted-foreground ml-1">{expense.currency}</span>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecentExpenses;
