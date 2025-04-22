
// This is a simple implementation of a backend service using localStorage
// In a real application, this would be replaced with actual API calls

import { v4 as uuidv4 } from 'uuid';

// Add uuid package
<lov-add-dependency>uuid@latest</lov-add-dependency>
<lov-add-dependency>@types/uuid@latest</lov-add-dependency>

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: string;
  offlineCreated?: boolean;
}

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Expense API
export const expenseAPI = {
  async getAll(): Promise<Expense[]> {
    await delay(300); // Simulate network delay
    const expenses = localStorage.getItem('expenses');
    return expenses ? JSON.parse(expenses) : [];
  },

  async create(expense: Omit<Expense, 'id'>): Promise<Expense> {
    await delay(300); // Simulate network delay
    const newExpense = {
      ...expense,
      id: uuidv4(),
    };
    
    const existingExpenses = await this.getAll();
    const updatedExpenses = [newExpense, ...existingExpenses];
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    
    // Dispatch an event for real-time updates
    window.dispatchEvent(new Event('expenseAdded'));
    
    return newExpense;
  },

  async update(id: string, expense: Partial<Expense>): Promise<Expense> {
    await delay(300); // Simulate network delay
    const expenses = await this.getAll();
    const index = expenses.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error(`Expense with id ${id} not found`);
    }
    
    const updatedExpense = { ...expenses[index], ...expense };
    expenses[index] = updatedExpense;
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    return updatedExpense;
  },

  async delete(id: string): Promise<void> {
    await delay(300); // Simulate network delay
    const expenses = await this.getAll();
    const filteredExpenses = expenses.filter(e => e.id !== id);
    localStorage.setItem('expenses', JSON.stringify(filteredExpenses));
  },

  async syncOfflineExpenses(): Promise<void> {
    const offlineExpenses = localStorage.getItem('offlineExpenses');
    
    if (offlineExpenses) {
      const expenses = JSON.parse(offlineExpenses);
      
      // In a real app, this would send the expenses to a server
      const existingExpenses = await this.getAll();
      const allExpenses = [...expenses, ...existingExpenses];
      
      localStorage.setItem('expenses', JSON.stringify(allExpenses));
      localStorage.removeItem('offlineExpenses');
      
      // Notify components about the update
      window.dispatchEvent(new Event('expenseAdded'));
    }
  }
};

// Currency API
export const currencyAPI = {
  async getRate(from: string, to: string): Promise<number> {
    await delay(300); // Simulate network delay
    
    // These are mock conversion rates - in a real app, you'd fetch from an API
    const rates: Record<string, Record<string, number>> = {
      USD: { EUR: 0.85, GBP: 0.74, JPY: 110.5, INR: 74.5 },
      EUR: { USD: 1.18, GBP: 0.87, JPY: 130.2, INR: 88.1 },
      GBP: { USD: 1.36, EUR: 1.15, JPY: 150.1, INR: 100.8 },
      JPY: { USD: 0.009, EUR: 0.0077, GBP: 0.0067, INR: 0.67 },
      INR: { USD: 0.0134, EUR: 0.0114, GBP: 0.0099, JPY: 1.48 }
    };
    
    // If same currency, return 1
    if (from === to) return 1;
    
    // If conversion exists, return it
    if (rates[from] && rates[from][to]) {
      return rates[from][to];
    }
    
    // Default fallback
    return 1;
  },
  
  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    const rate = await this.getRate(from, to);
    return amount * rate;
  }
};
