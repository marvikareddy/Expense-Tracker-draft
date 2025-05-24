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
      
      // If no family members exist, return an empty array
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(member => ({
        id: member.id,
        name: member.name,
        age: member.age || 0,
        savings: member.savings || 0,
        allowance: member.allowance || 0,
        image: member.image || '👤',
        isParent: member.is_parent || false
      }));
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
          image: member.image || '👤',
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
        age: data.age || 0,
        savings: data.savings || 0,
        allowance: data.allowance || 0,
        image: data.image || '👤',
        isParent: data.is_parent || false
      };
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  },
  
  // Update family member
  updateFamilyMember: async (memberId: string, updates: Partial<FamilyMember>): Promise<FamilyMember> => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.age !== undefined) updateData.age = updates.age;
      if (updates.savings !== undefined) updateData.savings = updates.savings;
      if (updates.allowance !== undefined) updateData.allowance = updates.allowance;
      if (updates.image !== undefined) updateData.image = updates.image;
      if (updates.isParent !== undefined) updateData.is_parent = updates.isParent;
      
      const { data, error } = await supabase
        .from('family_members')
        .update(updateData)
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
        age: data.age || 0,
        savings: data.savings || 0,
        allowance: data.allowance || 0,
        image: data.image || '👤',
        isParent: data.is_parent || false
      };
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  },
  
  // Add funds to a family member
  addFunds: async (memberId: string, amount: number): Promise<FamilyMember> => {
    try {
      // Get current member first
      const { data: currentMember, error: fetchError } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', memberId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching family member:', fetchError);
        throw fetchError;
      }
      
      const newSavings = (parseFloat(currentMember.savings) || 0) + amount;
      
      // Update the member with new funds
      const { data, error } = await supabase
        .from('family_members')
        .update({ savings: newSavings })
        .eq('id', memberId)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding funds:', error);
        throw error;
      }
      
      return {
        id: data.id,
        name: data.name,
        age: data.age || 0,
        savings: data.savings || 0,
        allowance: data.allowance || 0,
        image: data.image || '👤',
        isParent: data.is_parent || false
      };
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  },
  
  // Get all savings goals for the family
  getSavingsGoals: async (userId: string): Promise<SavingsGoal[]> => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select(`
          *,
          family_members(name)
        `)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching savings goals:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(goal => {
        const percentComplete = goal.target_amount > 0 
          ? (goal.current_amount / goal.target_amount) * 100 
          : 0;
          
        return {
          id: goal.id,
          name: goal.name,
          currentAmount: goal.current_amount || 0,
          targetAmount: goal.target_amount,
          percentComplete: parseFloat(percentComplete.toFixed(1)),
          targetDate: goal.target_date || '',
          memberId: goal.member_id
        };
      });
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
          target_date: goal.targetDate || ''
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error adding savings goal:', error);
        throw error;
      }
      
      const percentComplete = data.target_amount > 0 
        ? (data.current_amount / data.target_amount) * 100 
        : 0;
        
      return {
        id: data.id,
        name: data.name,
        currentAmount: data.current_amount || 0,
        targetAmount: data.target_amount,
        percentComplete: parseFloat(percentComplete.toFixed(1)),
        targetDate: data.target_date || '',
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
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
      if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
      if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate;
      
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updateData)
        .eq('id', goalId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating savings goal:', error);
        throw error;
      }
      
      const percentComplete = data.target_amount > 0 
        ? (data.current_amount / data.target_amount) * 100 
        : 0;
        
      return {
        id: data.id,
        name: data.name,
        currentAmount: data.current_amount || 0,
        targetAmount: data.target_amount,
        percentComplete: parseFloat(percentComplete.toFixed(1)),
        targetDate: data.target_date || '',
        memberId: data.member_id
      };
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  },
  
  // Get spending data for the pie chart
  getSpendingData: async (userId: string, memberId?: string | number): Promise<Array<{name: string, value: number, color: string}>> {
    try {
      // Fetch real spending data from expenses table if possible
      let query = supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', userId);
        
      if (memberId !== undefined) {
        // Always convert memberId to string before using it in the query
        query = query.eq('member_id', String(memberId));
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
          'Other': '#E0E0E0',
          'Toys': '#FFB6C1'
        };
        
        // Convert to array format needed for pie chart
        return Object.keys(categoryTotals).map(category => ({
          name: category,
          value: categoryTotals[category],
          color: colors[category] || '#888888'
        }));
      }
      
      // Return empty data if no expenses exist
      return [];
    } catch (error) {
      console.error('Error fetching spending data:', error);
      throw error;
    }
  }
};
