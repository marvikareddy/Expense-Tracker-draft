
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
      localStorage.clear();
      
      // Delete ALL data from ALL tables (not just user-specific)
      console.log('Clearing all database tables...');
      
      // Delete all savings goals
      const { error: goalsError } = await supabase
        .from('savings_goals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (goalsError) {
        console.error('Error deleting all savings goals:', goalsError);
      }
      
      // Delete all expenses
      const { error: expensesError } = await supabase
        .from('expenses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (expensesError) {
        console.error('Error deleting all expenses:', expensesError);
      }
      
      // Delete all family members
      const { error: membersError } = await supabase
        .from('family_members')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (membersError) {
        console.error('Error deleting all family members:', membersError);
      }
      
      // Delete all exchange rates
      const { error: ratesError } = await supabase
        .from('exchange_rates')
        .delete()
        .neq('id', 0);
        
      if (ratesError) {
        console.error('Error deleting all exchange rates:', ratesError);
      }
      
      // Delete all transaction labels
      const { error: transactionLabelsError } = await supabase
        .from('transaction_labels')
        .delete()
        .neq('transaction_id', '00000000-0000-0000-0000-000000000000');
        
      if (transactionLabelsError) {
        console.error('Error deleting all transaction labels:', transactionLabelsError);
      }
      
      // Delete all categories
      const { error: categoriesError } = await supabase
        .from('categories')
        .delete()
        .neq('id', 0);
        
      if (categoriesError) {
        console.error('Error deleting all categories:', categoriesError);
      }
      
      // Delete all accounts
      const { error: accountsError } = await supabase
        .from('accounts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (accountsError) {
        console.error('Error deleting all accounts:', accountsError);
      }
      
      // Delete all transactions
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (transactionsError) {
        console.error('Error deleting all transactions:', transactionsError);
      }
      
      // Delete all attachments
      const { error: attachmentsError } = await supabase
        .from('attachments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (attachmentsError) {
        console.error('Error deleting all attachments:', attachmentsError);
      }
      
      // Delete all budgets
      const { error: budgetsError } = await supabase
        .from('budgets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (budgetsError) {
        console.error('Error deleting all budgets:', budgetsError);
      }
      
      // Delete all labels
      const { error: labelsError } = await supabase
        .from('labels')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (labelsError) {
        console.error('Error deleting all labels:', labelsError);
      }
      
      // Delete all reimbursements
      const { error: reimbursementsError } = await supabase
        .from('reimbursements')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (reimbursementsError) {
        console.error('Error deleting all reimbursements:', reimbursementsError);
      }
      
      // Delete all book members
      const { error: bookMembersError } = await supabase
        .from('book_members')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (bookMembersError) {
        console.error('Error deleting all book members:', bookMembersError);
      }
      
      // Delete all loans
      const { error: loansError } = await supabase
        .from('loans')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (loansError) {
        console.error('Error deleting all loans:', loansError);
      }
      
      // Delete all recurring transactions
      const { error: recurringError } = await supabase
        .from('recurring_transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (recurringError) {
        console.error('Error deleting all recurring transactions:', recurringError);
      }
      
      // Delete all books
      const { error: booksError } = await supabase
        .from('books')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (booksError) {
        console.error('Error deleting all books:', booksError);
      }
      
      // Delete all users
      const { error: usersError } = await supabase
        .from('users')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (usersError) {
        console.error('Error deleting all users:', usersError);
      }
      
      console.log('Complete database reset completed successfully');
    } catch (error) {
      console.error('Error during complete database reset:', error);
      throw error;
    }
  }
};
