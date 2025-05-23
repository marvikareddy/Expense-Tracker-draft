
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
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('allowance')
        .eq('id', memberId)
        .single();
        
      if (error) {
        console.error('Error fetching pocket money:', error);
        throw error;
      }
      
      return data?.allowance || 50.00;
    } catch (error) {
      console.error('Error fetching pocket money:', error);
      throw error;
    }
  },

  // Get child's savings goal
  getSavingsGoal: async (memberId: string): Promise<{current: number, target: number, item: string}> => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        // If no goal exists, return mock data
        return {
          current: 125.00,
          target: 200.00,
          item: "new bike"
        };
      }
      
      return {
        current: data.current_amount,
        target: data.target_amount,
        item: data.name
      };
    } catch (error) {
      console.error('Error fetching savings goal:', error);
      throw error;
    }
  },

  // Add to child's savings
  addToSavings: async (memberId: string, amount: number): Promise<{current: number, target: number}> => {
    try {
      // First, get the savings goal
      const { data: goalData, error: goalError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (goalError) {
        console.error('Error getting savings goal:', goalError);
        throw goalError;
      }
      
      // Update the current amount
      const newAmount = goalData.current_amount + amount;
      
      const { data, error } = await supabase
        .from('savings_goals')
        .update({ current_amount: newAmount })
        .eq('id', goalData.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating savings:', error);
        throw error;
      }
      
      return {
        current: data.current_amount,
        target: data.target_amount
      };
    } catch (error) {
      console.error('Error adding to savings:', error);
      throw error;
    }
  },

  // Get child's rewards
  getRewards: async (memberId: string): Promise<ChildReward[]> => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('member_id', memberId);
        
      if (error) {
        console.error('Error fetching rewards:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        return data.map(reward => ({
          id: reward.id,
          name: reward.name,
          description: reward.description,
          memberId: reward.member_id
        }));
      }
      
      // Return mock data if no rewards exist
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
        .eq('member_id', memberId)
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
          memberId: expense.member_id
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
          user_id: userId,
          member_id: memberId,
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
        memberId: data.member_id
      };
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }
};
