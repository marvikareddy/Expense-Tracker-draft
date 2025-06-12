
import { supabase } from '@/integrations/supabase/client';

export interface ChildExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface ChildReward {
  id: string;
  name: string;
  description: string;
}

export const childService = {
  // Get child's pocket money
  getPocketMoney: async (childId: string): Promise<number> => {
    try {
      // For now, return mock data
      // In a full implementation, this would fetch from the database
      return 50.00;
    } catch (error) {
      console.error('Error fetching pocket money:', error);
      throw error;
    }
  },

  // Get child's savings goal
  getSavingsGoal: async (childId: string): Promise<{current: number, target: number, item: string}> => {
    try {
      // For now, return mock data
      // In a full implementation, this would fetch from the database
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

  // Get child's rewards
  getRewards: async (childId: string): Promise<ChildReward[]> => {
    try {
      // For now, return mock data
      // In a full implementation, this would fetch from the database
      return [
        { id: '1', name: "Extra TV Time", description: "30 minutes of extra TV time" },
        { id: '2', name: "Ice Cream Trip", description: "Visit to the ice cream shop" },
        { id: '3', name: "Game Time", description: "1 hour of video games" }
      ];
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
  },

  // Get child's expenses
  getExpenses: async (childId: string): Promise<ChildExpense[]> => {
    try {
      // For now, return mock data
      // In a full implementation, this would fetch from the database
      return [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }
};
