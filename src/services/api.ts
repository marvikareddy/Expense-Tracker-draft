
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
  member_id?: string;
}

export const expenseAPI = {
  // Get all expenses for the current user
  getAll: async (): Promise<Expense[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user) {
        console.log('No authenticated user found');
        return [];
      }
      
      console.log('Fetching expenses for user:', user.user.id);
      
      // Use the from method without TypeScript validation for now
      const { data, error } = await (supabase as any)
        .from('expenses')
        .select('*')
        .eq('user_id', user.user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }

      console.log('Successfully fetched expenses:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getAll expenses:', error);
      throw error;
    }
  },

  // Create a new expense
  create: async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
    try {
      console.log("Creating expense:", expense);
      
      // Ensure user is authenticated
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }
      
      // Make sure user_id is set correctly
      const expenseData = {
        ...expense,
        user_id: user.user.id
      };
      
      const { data, error } = await (supabase as any)
        .from('expenses')
        .insert(expenseData)
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        throw error;
      }

      console.log('Successfully created expense:', data);
      return data;
    } catch (error) {
      console.error('Error in create expense:', error);
      throw error;
    }
  },

  // Update an existing expense
  update: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    try {
      console.log('Updating expense:', id, expense);
      
      const { data, error } = await (supabase as any)
        .from('expenses')
        .update(expense)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        throw error;
      }

      console.log('Successfully updated expense:', data);
      return data;
    } catch (error) {
      console.error('Error in update expense:', error);
      throw error;
    }
  },

  // Delete an expense
  delete: async (id: string): Promise<void> => {
    try {
      console.log('Deleting expense:', id);
      
      const { error } = await (supabase as any)
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }

      console.log('Successfully deleted expense:', id);
    } catch (error) {
      console.error('Error in delete expense:', error);
      throw error;
    }
  },

  // Sync offline expenses
  syncOfflineExpenses: async (): Promise<void> => {
    try {
      const offlineExpensesString = localStorage.getItem('offlineExpenses');
      
      if (!offlineExpensesString) {
        console.log('No offline expenses to sync');
        return;
      }
      
      const offlineExpenses: Expense[] = JSON.parse(offlineExpensesString);
      
      if (offlineExpenses.length === 0) {
        console.log('No offline expenses to sync');
        return;
      }
      
      console.log('Syncing offline expenses:', offlineExpenses.length);
      
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }
      
      // Process each offline expense individually
      for (const expense of offlineExpenses) {
        // Remove any properties not needed for insert
        const { id, created_at, offlineCreated, ...expenseData } = expense;
        
        // Ensure user_id is set correctly
        const insertData = {
          ...expenseData,
          user_id: user.user.id
        };
        
        console.log('Syncing offline expense:', insertData);
        
        const { error } = await (supabase as any)
          .from('expenses')
          .insert(insertData);
          
        if (error) {
          console.error('Error syncing offline expense:', error);
          throw error;
        }
      }
      
      // Clear offline expenses after successful sync
      localStorage.removeItem('offlineExpenses');
      console.log('Successfully synced all offline expenses');
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
  
  console.log('Saved expense offline:', newExpense);
  return newExpense;
};
