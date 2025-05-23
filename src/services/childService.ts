
import { supabase } from '@/integrations/supabase/client';

export interface ChildExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  memberId: string;
}

export interface ChildReward {
  id: string;
  name: string;
  description: string;
  memberId: string;
}

export const childService = {
  // Get child's pocket money
  getPocketMoney: async (memberId: string): Promise<number> => {
    // Since there's no family_members table in the database, we'll use mock data
    // In a production app, you would store this in an appropriate table
    try {
      // Check if we can find the member in expenses to make it more realistic
      const { data } = await supabase
        .from('expenses')
        .select('id')
        .eq('user_id', memberId)
        .limit(1);
        
      // Return mock data
      return 50.00; // Default value
    } catch (error) {
      console.error('Error fetching pocket money:', error);
      throw error;
    }
  },

  // Get child's savings goal
  getSavingsGoal: async (memberId: string): Promise<{current: number, target: number, item: string}> => {
    try {
      // In a production app, you would create and query a savings_goals table
      // For now, return mock data based on user ID to maintain consistency
      
      return {
        current: 125.00,
        target: 200.00,
        item: "new bike"
      };
    } catch (error) {
      console.error('Error fetching savings goal:', error);
      throw error;
    }
  },

  // Add to child's savings
  addToSavings: async (memberId: string, amount: number): Promise<{current: number, target: number}> => {
    try {
      // In a production app, you would update a record in a savings_goals table
      
      // Return mock updated values
      return {
        current: 125.00 + amount,
        target: 200.00
      };
    } catch (error) {
      console.error('Error adding to savings:', error);
      throw error;
    }
  },

  // Get child's rewards
  getRewards: async (memberId: string): Promise<ChildReward[]> => {
    try {
      // Return mock data since rewards table doesn't exist yet
      return [
        { id: '1', name: "Extra TV Time", description: "30 minutes of extra TV time", memberId },
        { id: '2', name: "Ice Cream Trip", description: "Visit to the ice cream shop", memberId },
        { id: '3', name: "Game Time", description: "1 hour of video games", memberId }
      ];
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
  },

  // Get child's expenses
  getExpenses: async (memberId: string): Promise<ChildExpense[]> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', memberId)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        return data.map(expense => ({
          id: expense.id,
          date: expense.date,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          memberId: expense.user_id
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },
  
  // Add expense for child
  addExpense: async (userId: string, memberId: string, expense: Partial<ChildExpense>): Promise<ChildExpense> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          user_id: memberId, // Use memberId as the user_id for the expense
          date: expense.date || new Date().toISOString().split('T')[0],
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          currency: 'USD' // Default currency
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error adding expense:', error);
        throw error;
      }
      
      return {
        id: data.id,
        date: data.date,
        description: data.description,
        amount: data.amount,
        category: data.category,
        memberId: data.user_id
      };
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }
};
