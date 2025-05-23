
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
  // Get child's pocket money (allowance)
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
      
      return data.allowance || 0;
    } catch (error) {
      console.error('Error fetching pocket money:', error);
      throw error;
    }
  },

  // Get child's savings goal
  getSavingsGoal: async (memberId: string): Promise<{current: number, target: number, item: string}> => {
    try {
      // First get the child's current savings amount
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('savings')
        .eq('id', memberId)
        .single();
        
      if (memberError) {
        console.error('Error fetching member savings:', memberError);
        throw memberError;
      }
      
      // Then get the savings goal
      const { data: goalData, error: goalError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (goalError) {
        // If no goal found, return a default object
        if (goalError.code === 'PGRST116') {
          return {
            current: memberData.savings || 0,
            target: 0,
            item: "No goal set"
          };
        }
        console.error('Error fetching savings goal:', goalError);
        throw goalError;
      }
      
      return {
        current: memberData.savings || 0,
        target: goalData.target_amount || 0,
        item: goalData.name || "Goal"
      };
    } catch (error) {
      console.error('Error fetching savings goal:', error);
      // Return a default object in case of error
      return {
        current: 0,
        target: 0,
        item: "No goal set"
      };
    }
  },

  // Add to child's savings
  addToSavings: async (memberId: string, amount: number): Promise<{current: number, target: number}> => {
    try {
      // Get current savings first
      const { data: currentData, error: currentError } = await supabase
        .from('family_members')
        .select('savings')
        .eq('id', memberId)
        .single();
        
      if (currentError) {
        console.error('Error fetching current savings:', currentError);
        throw currentError;
      }
      
      const currentSavings = currentData.savings || 0;
      const newSavings = currentSavings + amount;
      
      // Update the savings amount
      const { data: updateData, error: updateError } = await supabase
        .from('family_members')
        .update({ savings: newSavings })
        .eq('id', memberId)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating savings:', updateError);
        throw updateError;
      }
      
      // Get the savings goal
      const { data: goalData, error: goalError } = await supabase
        .from('savings_goals')
        .select('target_amount')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      return {
        current: newSavings,
        target: goalError ? 0 : (goalData.target_amount || 0)
      };
    } catch (error) {
      console.error('Error adding to savings:', error);
      throw error;
    }
  },

  // Get child's rewards (mock data as we don't have a rewards table yet)
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
