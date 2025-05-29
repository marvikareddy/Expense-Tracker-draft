
import { supabase } from '@/integrations/supabase/client';
import { familyService } from './familyService';

export const resetService = {
  resetAllAccountData: async (userId: string): Promise<void> => {
    try {
      console.log('Starting account reset for user:', userId);
      
      // Get all family members first
      const familyMembers = await familyService.getFamilyMembers(userId);
      
      // Clear localStorage for each member
      familyMembers.forEach(member => {
        const expenseKey = `expenses_${member.id}`;
        const rewardKey = `rewards_${member.id}`;
        localStorage.removeItem(expenseKey);
        localStorage.removeItem(rewardKey);
      });
      
      // Clear selected profile and other app data
      localStorage.removeItem('selectedProfile');
      localStorage.removeItem('offlineExpenses');
      
      // Delete all data in the correct order to avoid foreign key constraints
      
      // Delete all savings goals for this user
      const { error: goalsError } = await supabase
        .from('savings_goals')
        .delete()
        .eq('user_id', userId);
        
      if (goalsError) {
        console.error('Error deleting savings goals:', goalsError);
      }
      
      // Delete all expenses for this user
      const { error: expensesError } = await supabase
        .from('expenses')
        .delete()
        .eq('user_id', userId);
        
      if (expensesError) {
        console.error('Error deleting expenses:', expensesError);
      }
      
      // Delete all family members for this user
      const { error: membersError } = await supabase
        .from('family_members')
        .delete()
        .eq('user_id', userId);
        
      if (membersError) {
        console.error('Error deleting family members:', membersError);
        throw membersError;
      }
      
      console.log('Account reset completed successfully');
    } catch (error) {
      console.error('Error resetting account data:', error);
      throw error;
    }
  }
};
