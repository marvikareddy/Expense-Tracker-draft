
import { supabase } from '@/integrations/supabase/client';

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  savings: number;
  allowance: number;
  image: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  percentComplete: number;
  targetDate: string;
}

export const familyService = {
  // Get all family members for the current user
  getFamilyMembers: async (userId: string): Promise<FamilyMember[]> => {
    try {
      // For now, return mock data
      // In a full implementation, this would fetch from the database
      return [
        { id: '1', name: "Emma", age: 10, savings: 125, allowance: 50, image: "👧" },
        { id: '2', name: "Jake", age: 14, savings: 230, allowance: 75, image: "👦" }
      ];
    } catch (error) {
      console.error('Error fetching family members:', error);
      throw error;
    }
  },

  // Get all savings goals for the family
  getSavingsGoals: async (userId: string): Promise<SavingsGoal[]> => {
    try {
      // For now, return mock data
      // In a full implementation, this would fetch from the database
      return [
        { 
          id: '1', 
          name: "Summer Vacation", 
          currentAmount: 1200, 
          targetAmount: 3000, 
          percentComplete: 40, 
          targetDate: "August 2025" 
        },
        { 
          id: '2', 
          name: "New Computer", 
          currentAmount: 800, 
          targetAmount: 1200, 
          percentComplete: 67, 
          targetDate: "June 2025" 
        }
      ];
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      throw error;
    }
  },

  // Get spending data for the pie chart
  getSpendingData: async (userId: string): Promise<any[]> => {
    try {
      // For now, return mock data
      // In a full implementation, this would fetch from the database
      return [
        { name: 'Education', value: 400, color: '#9b87f5' },
        { name: 'Food', value: 300, color: '#F2FCE2' },
        { name: 'Entertainment', value: 200, color: '#FEC6A1' },
        { name: 'Savings', value: 500, color: '#D3E4FD' }
      ];
    } catch (error) {
      console.error('Error fetching spending data:', error);
      throw error;
    }
  }
};
