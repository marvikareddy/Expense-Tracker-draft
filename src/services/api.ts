
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  currency: string;
  date: string;
  created_at?: string;
  offlineCreated?: boolean;
}

export const expenseAPI = {
  // Get all expenses for the current user
  getAll: async (): Promise<Expense[]> => {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }

    return data || [];
  },

  // Create a new expense
  create: async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
    console.log("Creating expense:", expense);
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw error;
    }

    return data;
  },

  // Update an existing expense
  update: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    return data;
  },

  // Delete an expense
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  // Sync offline expenses
  syncOfflineExpenses: async (): Promise<void> => {
    const offlineExpensesString = localStorage.getItem('offlineExpenses');
    
    if (!offlineExpensesString) {
      return;
    }
    
    try {
      const offlineExpenses: Expense[] = JSON.parse(offlineExpensesString);
      
      if (offlineExpenses.length === 0) {
        return;
      }
      
      // Process each offline expense individually
      for (const expense of offlineExpenses) {
        // Make sure each expense has a user_id
        if (!expense.user_id) {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            expense.user_id = data.user.id;
          }
        }
        
        // Remove any properties not needed for insert
        const { id, created_at, offlineCreated, ...expenseData } = expense;
        
        await supabase
          .from('expenses')
          .insert({
            ...expenseData,
            user_id: expense.user_id
          });
      }
      
      // Clear offline expenses after successful sync
      localStorage.removeItem('offlineExpenses');
    } catch (error) {
      console.error('Error syncing offline expenses:', error);
      throw error;
    }
  }
};

// Offline expense handling
export const saveExpenseOffline = (expense: Omit<Expense, 'id'>): Expense => {
  const newExpense: Expense = {
    id: uuidv4(),
    ...expense,
    offlineCreated: true
  };

  const storedExpenses = JSON.parse(localStorage.getItem('offlineExpenses') || '[]');
  storedExpenses.push(newExpense);
  localStorage.setItem('offlineExpenses', JSON.stringify(storedExpenses));
  
  return newExpense;
};
