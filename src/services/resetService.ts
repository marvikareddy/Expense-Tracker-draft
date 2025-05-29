
import { supabase } from '@/integrations/supabase/client';
import { familyService } from './familyService';

export const resetService = {
  resetAllAccountData: async (userId: string): Promise<void> => {
    try {
      console.log('Starting complete database reset for user:', userId);
      
      // Get all family members first
      const familyMembers = await familyService.getFamilyMembers(userId);
      
      // Clear localStorage for each member
      familyMembers.forEach(member => {
        const expenseKey = `expenses_${member.id}`;
        const rewardKey = `rewards_${member.id}`;
        localStorage.removeItem(expenseKey);
        localStorage.removeItem(rewardKey);
      });
      
      // Clear all localStorage data
      localStorage.removeItem('selectedProfile');
      localStorage.removeItem('offlineExpenses');
      
      // Delete ALL data from ALL tables (not just user-specific)
      console.log('Clearing all database tables...');
      
      // Delete all savings goals
      const { error: goalsError } = await supabase
        .from('savings_goals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
        
      if (goalsError) {
        console.error('Error deleting all savings goals:', goalsError);
      }
      
      // Delete all expenses
      const { error: expensesError } = await supabase
        .from('expenses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
        
      if (expensesError) {
        console.error('Error deleting all expenses:', expensesError);
      }
      
      // Delete all family members
      const { error: membersError } = await supabase
        .from('family_members')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
        
      if (membersError) {
        console.error('Error deleting all family members:', membersError);
      }
      
      // Delete all exchange rates
      const { error: ratesError } = await supabase
        .from('exchange_rates')
        .delete()
        .neq('id', 0); // Delete all rows
        
      if (ratesError) {
        console.error('Error deleting all exchange rates:', ratesError);
      }
      
      // Delete all other tables that might have data
      const tablesToClear = [
        'transaction_labels',
        'categories', 
        'accounts',
        'transactions',
        'attachments',
        'budgets',
        'labels',
        'reimbursements',
        'book_members',
        'loans',
        'recurring_transactions',
        'books',
        'users'
      ];
      
      for (const table of tablesToClear) {
        try {
          const { error } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
            
          if (error) {
            console.error(`Error clearing table ${table}:`, error);
          } else {
            console.log(`Successfully cleared table: ${table}`);
          }
        } catch (err) {
          console.error(`Failed to clear table ${table}:`, err);
        }
      }
      
      console.log('Complete database reset completed successfully');
    } catch (error) {
      console.error('Error during complete database reset:', error);
      throw error;
    }
  }
};
