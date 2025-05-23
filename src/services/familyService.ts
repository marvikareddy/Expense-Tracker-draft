
import { supabase } from '@/integrations/supabase/client';

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  savings: number;
  allowance: number;
  image: string;
  isParent: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  percentComplete: number;
  targetDate: string;
  memberId: string;
}

export const familyService = {
  // Get all family members for the current user
  getFamilyMembers: async (userId: string): Promise<FamilyMember[]> => {
    try {
      // In a production app, you would create and query a family_members table
      // For now, return mock data that remains consistent for a specific user ID
      
      // Return default family members
      return [
        { id: '1', name: "Emma", age: 10, savings: 125, allowance: 50, image: "👧", isParent: false },
        { id: '2', name: "Jake", age: 14, savings: 230, allowance: 75, image: "👦", isParent: false },
        { id: '3', name: "Mom", age: 40, savings: 0, allowance: 0, image: "👩", isParent: true },
        { id: '4', name: "Dad", age: 42, savings: 0, allowance: 0, image: "👨", isParent: true }
      ];
    } catch (error) {
      console.error('Error fetching family members:', error);
      throw error;
    }
  },
  
  // Add a new family member
  addFamilyMember: async (userId: string, member: Partial<FamilyMember>): Promise<FamilyMember> => {
    try {
      // In a production app, you would insert into a family_members table
      // For now, return the member with a mock ID
      return {
        id: Math.random().toString(36).substring(7),
        name: member.name || '',
        age: member.age || 0,
        savings: member.savings || 0,
        allowance: member.allowance || 0,
        image: member.image || "👤",
        isParent: member.isParent || false
      };
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  },
  
  // Update family member
  updateFamilyMember: async (memberId: string, updates: Partial<FamilyMember>): Promise<FamilyMember> => {
    try {
      // In a production app, you would update a record in a family_members table
      
      // Return mock updated member
      return {
        id: memberId,
        name: updates.name || 'Updated Name',
        age: updates.age || 0,
        savings: updates.savings || 0,
        allowance: updates.allowance || 0,
        image: updates.image || "👤",
        isParent: updates.isParent || false
      };
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  },

  // Get all savings goals for the family
  getSavingsGoals: async (userId: string): Promise<SavingsGoal[]> => {
    try {
      // In a production app, you would query a savings_goals table
      
      // Return default savings goals
      return [
        { 
          id: '1', 
          name: "New Bike", 
          currentAmount: 125, 
          targetAmount: 200, 
          percentComplete: 62.5, 
          targetDate: "August 2025",
          memberId: '1'
        },
        { 
          id: '2', 
          name: "Gaming Console", 
          currentAmount: 180, 
          targetAmount: 300, 
          percentComplete: 60, 
          targetDate: "December 2025",
          memberId: '2'
        },
        { 
          id: '3', 
          name: "Family Vacation", 
          currentAmount: 1200, 
          targetAmount: 3000, 
          percentComplete: 40, 
          targetDate: "August 2025",
          memberId: '3'
        }
      ];
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      throw error;
    }
  },
  
  // Add new savings goal
  addSavingsGoal: async (userId: string, memberId: string, goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      // In a production app, you would insert into a savings_goals table
      
      // Return mock goal with ID
      return {
        id: Math.random().toString(36).substring(7),
        name: goal.name || '',
        currentAmount: goal.currentAmount || 0,
        targetAmount: goal.targetAmount || 0,
        percentComplete: goal.currentAmount && goal.targetAmount ? 
          (goal.currentAmount / goal.targetAmount) * 100 : 0,
        targetDate: goal.targetDate || '',
        memberId: memberId
      };
    } catch (error) {
      console.error('Error adding savings goal:', error);
      throw error;
    }
  },
  
  // Update savings goal
  updateSavingsGoal: async (goalId: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      // In a production app, you would update a record in a savings_goals table
      
      const currentAmount = updates.currentAmount || 0;
      const targetAmount = updates.targetAmount || 100;
      
      // Return mock updated goal
      return {
        id: goalId,
        name: updates.name || '',
        currentAmount: currentAmount,
        targetAmount: targetAmount,
        percentComplete: (currentAmount / targetAmount) * 100,
        targetDate: updates.targetDate || '',
        memberId: '1' // Default member ID
      };
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  },

  // Get spending data for the pie chart
  getSpendingData: async (userId: string, memberId?: string): Promise<any[]> => {
    try {
      // Fetch real spending data from expenses table if possible
      let query = supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', userId);
        
      if (memberId) {
        query = query.eq('user_id', memberId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching spending data:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // Group data by category and sum amounts
        const categoryTotals: Record<string, number> = {};
        data.forEach(expense => {
          const category = expense.category;
          categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
        });
        
        // Define colors for categories
        const colors: Record<string, string> = {
          'Education': '#9b87f5',
          'Food': '#F2FCE2',
          'Entertainment': '#FEC6A1',
          'Savings': '#D3E4FD',
          'Shopping': '#FFD6E0',
          'Transport': '#C5F5CA',
          'Bills': '#FFEB99',
          'Other': '#E0E0E0'
        };
        
        // Convert to array format needed for pie chart
        return Object.keys(categoryTotals).map(category => ({
          name: category,
          value: categoryTotals[category],
          color: colors[category] || '#888888'
        }));
      }
      
      // Return mock data if no real data exists
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
