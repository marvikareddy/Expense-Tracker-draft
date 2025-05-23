
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
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching family members:', error);
        throw error;
      }

      if (data && data.length > 0) {
        return data.map(member => ({
          id: member.id,
          name: member.name,
          age: member.age,
          savings: member.savings,
          allowance: member.allowance,
          image: member.image,
          isParent: member.is_parent
        }));
      }
      
      // Return default family members if none exist yet
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
      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          user_id: userId,
          name: member.name,
          age: member.age || 0,
          savings: member.savings || 0,
          allowance: member.allowance || 0,
          image: member.image || "👤",
          is_parent: member.isParent || false
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding family member:', error);
        throw error;
      }
      
      return {
        id: data.id,
        name: data.name,
        age: data.age,
        savings: data.savings,
        allowance: data.allowance,
        image: data.image,
        isParent: data.is_parent
      };
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  },
  
  // Update family member
  updateFamilyMember: async (memberId: string, updates: Partial<FamilyMember>): Promise<FamilyMember> => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .update({
          name: updates.name,
          age: updates.age,
          savings: updates.savings,
          allowance: updates.allowance,
          image: updates.image,
          is_parent: updates.isParent
        })
        .eq('id', memberId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating family member:', error);
        throw error;
      }
      
      return {
        id: data.id,
        name: data.name,
        age: data.age,
        savings: data.savings,
        allowance: data.allowance,
        image: data.image,
        isParent: data.is_parent
      };
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  },

  // Get all savings goals for the family
  getSavingsGoals: async (userId: string): Promise<SavingsGoal[]> => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*, family_members(name)')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching savings goals:', error);
        throw error;
      }

      if (data && data.length > 0) {
        return data.map(goal => ({
          id: goal.id,
          name: goal.name,
          currentAmount: goal.current_amount,
          targetAmount: goal.target_amount,
          percentComplete: (goal.current_amount / goal.target_amount) * 100,
          targetDate: goal.target_date,
          memberId: goal.member_id
        }));
      }
      
      // Return default savings goals if none exist yet
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
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{
          user_id: userId,
          member_id: memberId,
          name: goal.name,
          current_amount: goal.currentAmount || 0,
          target_amount: goal.targetAmount || 0,
          target_date: goal.targetDate
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding savings goal:', error);
        throw error;
      }
      
      return {
        id: data.id,
        name: data.name,
        currentAmount: data.current_amount,
        targetAmount: data.target_amount,
        percentComplete: (data.current_amount / data.target_amount) * 100,
        targetDate: data.target_date,
        memberId: data.member_id
      };
    } catch (error) {
      console.error('Error adding savings goal:', error);
      throw error;
    }
  },
  
  // Update savings goal
  updateSavingsGoal: async (goalId: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update({
          name: updates.name,
          current_amount: updates.currentAmount,
          target_amount: updates.targetAmount,
          target_date: updates.targetDate
        })
        .eq('id', goalId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating savings goal:', error);
        throw error;
      }
      
      return {
        id: data.id,
        name: data.name,
        currentAmount: data.current_amount,
        targetAmount: data.target_amount,
        percentComplete: (data.current_amount / data.target_amount) * 100,
        targetDate: data.target_date,
        memberId: data.member_id
      };
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  },

  // Get spending data for the pie chart
  getSpendingData: async (userId: string, memberId?: string): Promise<any[]> => {
    try {
      // If memberId is provided, fetch spending for that member only
      let query = supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', userId);
        
      if (memberId) {
        query = query.eq('member_id', memberId);
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
