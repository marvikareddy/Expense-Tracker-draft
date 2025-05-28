
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

export interface SpendingDataItem {
  name: string;
  value: number;
  color: string;
}

export const familyService = {
  getFamilyMembers: async (userId: string): Promise<FamilyMember[]> => {
    try {
      console.log('Fetching family members for user:', userId);
      const userIdStr = String(userId);

      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userIdStr);

      if (error) {
        console.error('Error fetching family members:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No family members found');
        return [];
      }

      const members = data.map(member => ({
        id: member.id,
        name: member.name,
        age: Number(member.age) || 0,
        savings: parseFloat(String(member.savings)) || 0,
        allowance: parseFloat(String(member.allowance)) || 0,
        image: member.image || '👤',
        isParent: member.is_parent || false
      }));

      console.log('Successfully fetched family members:', members);
      return members;
    } catch (error) {
      console.error('Error fetching family members:', error);
      throw error;
    }
  },

  addFamilyMember: async (userId: string, member: Partial<FamilyMember>): Promise<FamilyMember> => {
    try {
      console.log('Adding family member:', member);
      const userIdStr = String(userId);

      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          user_id: userIdStr,
          name: member.name,
          age: Number(member.age) || 0,
          savings: Number(member.savings) || 0,
          allowance: Number(member.allowance) || 0,
          image: member.image || '👤',
          is_parent: member.isParent || false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding family member:', error);
        throw error;
      }

      const newMember = {
        id: data.id,
        name: data.name,
        age: Number(data.age) || 0,
        savings: parseFloat(String(data.savings)) || 0,
        allowance: parseFloat(String(data.allowance)) || 0,
        image: data.image || '👤',
        isParent: data.is_parent || false
      };

      console.log('Successfully added family member:', newMember);
      return newMember;
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  },

  updateFamilyMember: async (memberId: string, updates: Partial<FamilyMember>): Promise<FamilyMember> => {
    try {
      console.log('Updating family member:', memberId, updates);
      const memberIdStr = String(memberId);

      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.age !== undefined) updateData.age = Number(updates.age);
      if (updates.savings !== undefined) updateData.savings = Number(updates.savings);
      if (updates.allowance !== undefined) updateData.allowance = Number(updates.allowance);
      if (updates.image !== undefined) updateData.image = updates.image;
      if (updates.isParent !== undefined) updateData.is_parent = updates.isParent;

      const { data, error } = await supabase
        .from('family_members')
        .update(updateData)
        .eq('id', memberIdStr)
        .select()
        .single();

      if (error) {
        console.error('Error updating family member:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      const updatedMember = {
        id: data.id,
        name: data.name,
        age: Number(data.age) || 0,
        savings: parseFloat(String(data.savings)) || 0,
        allowance: parseFloat(String(data.allowance)) || 0,
        image: data.image || '👤',
        isParent: data.is_parent || false
      };

      console.log('Successfully updated family member:', updatedMember);
      return updatedMember;
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  },

  deleteFamilyMember: async (memberId: string): Promise<void> => {
    try {
      console.log('Deleting family member:', memberId);
      const memberIdStr = String(memberId);

      // Delete related savings goals first
      const { error: goalsError } = await supabase
        .from('savings_goals')
        .delete()
        .eq('member_id', memberIdStr);

      if (goalsError) {
        console.error('Error deleting related savings goals:', goalsError);
      }

      // Delete the family member
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberIdStr);

      if (error) {
        console.error('Error deleting family member:', error);
        throw error;
      }

      console.log('Successfully deleted family member:', memberIdStr);
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw error;
    }
  },

  addFunds: async (memberId: string, amount: number): Promise<FamilyMember> => {
    try {
      console.log('Adding funds to member:', memberId, amount);
      const memberIdStr = String(memberId);
      
      const { data: currentMember, error: fetchError } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', memberIdStr)
        .single();

      if (fetchError) {
        console.error('Error fetching current member:', fetchError);
        throw fetchError;
      }

      const currentSavings = parseFloat(String(currentMember.savings)) || 0;
      const newSavings = currentSavings + amount;

      const { data, error } = await supabase
        .from('family_members')
        .update({ savings: newSavings })
        .eq('id', memberIdStr)
        .select()
        .single();

      if (error) {
        console.error('Error updating savings:', error);
        throw error;
      }

      const updatedMember = {
        id: data.id,
        name: data.name,
        age: Number(data.age) || 0,
        savings: parseFloat(String(data.savings)) || 0,
        allowance: parseFloat(String(data.allowance)) || 0,
        image: data.image || '👤',
        isParent: data.is_parent || false
      };

      console.log('Successfully added funds:', updatedMember);
      return updatedMember;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  },

  getSavingsGoals: async (userId: string): Promise<SavingsGoal[]> => {
    try {
      console.log('Fetching savings goals for user:', userId);
      const userIdStr = String(userId);
      
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userIdStr);

      if (error) {
        console.error('Error fetching savings goals:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No savings goals found');
        return [];
      }

      const goals = data.map(goal => {
        const currentAmount = parseFloat(String(goal.current_amount)) || 0;
        const targetAmount = parseFloat(String(goal.target_amount)) || 0;
        const percentComplete = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

        return {
          id: goal.id,
          name: goal.name,
          currentAmount,
          targetAmount,
          percentComplete: parseFloat(percentComplete.toFixed(1)),
          targetDate: goal.target_date || '',
          memberId: goal.member_id
        };
      });

      console.log('Successfully fetched savings goals:', goals);
      return goals;
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      throw error;
    }
  },

  addSavingsGoal: async (userId: string, memberId: string, goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      console.log('Adding savings goal:', goal);
      const userIdStr = String(userId);
      const memberIdStr = String(memberId);
      
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{
          user_id: userIdStr,
          member_id: memberIdStr,
          name: goal.name,
          current_amount: Number(goal.currentAmount) || 0,
          target_amount: Number(goal.targetAmount) || 0,
          target_date: goal.targetDate || ''
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding savings goal:', error);
        throw error;
      }

      const currentAmount = parseFloat(String(data.current_amount)) || 0;
      const targetAmount = parseFloat(String(data.target_amount)) || 0;
      const percentComplete = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

      const newGoal = {
        id: data.id,
        name: data.name,
        currentAmount,
        targetAmount,
        percentComplete: parseFloat(percentComplete.toFixed(1)),
        targetDate: data.target_date || '',
        memberId: data.member_id
      };

      console.log('Successfully added savings goal:', newGoal);
      return newGoal;
    } catch (error) {
      console.error('Error adding savings goal:', error);
      throw error;
    }
  },

  updateSavingsGoal: async (goalId: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      console.log('Updating savings goal:', goalId, updates);
      const goalIdStr = String(goalId);

      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.currentAmount !== undefined) updateData.current_amount = Number(updates.currentAmount);
      if (updates.targetAmount !== undefined) updateData.target_amount = Number(updates.targetAmount);
      if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate;

      const { data, error } = await supabase
        .from('savings_goals')
        .update(updateData)
        .eq('id', goalIdStr)
        .select()
        .single();

      if (error) {
        console.error('Error updating savings goal:', error);
        throw error;
      }

      const currentAmount = parseFloat(String(data.current_amount)) || 0;
      const targetAmount = parseFloat(String(data.target_amount)) || 0;
      const percentComplete = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

      const updatedGoal = {
        id: data.id,
        name: data.name,
        currentAmount,
        targetAmount,
        percentComplete: parseFloat(percentComplete.toFixed(1)),
        targetDate: data.target_date || '',
        memberId: data.member_id
      };

      console.log('Successfully updated savings goal:', updatedGoal);
      return updatedGoal;
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  },

  deleteSavingsGoal: async (goalId: string): Promise<void> => {
    try {
      console.log('Deleting savings goal:', goalId);
      const goalIdStr = String(goalId);

      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalIdStr);

      if (error) {
        console.error('Error deleting savings goal:', error);
        throw error;
      }

      console.log('Successfully deleted savings goal:', goalIdStr);
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      throw error;
    }
  },

  getSpendingData: async (userId: string): Promise<SpendingDataItem[]> => {
    try {
      console.log('Fetching spending data for user:', userId);
      const userIdStr = String(userId);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', userIdStr);

      if (error) {
        console.error('Error fetching spending data:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No spending data found');
        return [];
      }

      // Group expenses by category and sum amounts
      const categoryTotals: Record<string, number> = {};
      data.forEach(expense => {
        const category = expense.category || 'Other';
        const amount = parseFloat(String(expense.amount)) || 0;
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });

      // Convert to SpendingDataItem format with colors
      const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];
      const spendingData = Object.entries(categoryTotals).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      console.log('Successfully fetched spending data:', spendingData);
      return spendingData;
    } catch (error) {
      console.error('Error fetching spending data:', error);
      throw error;
    }
  },
};
