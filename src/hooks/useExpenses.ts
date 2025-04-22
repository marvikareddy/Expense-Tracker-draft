
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseAPI, Expense } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export function useExpenses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all expenses
  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: expenseAPI.getAll
  });

  // Create a new expense
  const createExpense = useMutation({
    mutationFn: (expense: Omit<Expense, 'id'>) => expenseAPI.create(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Expense Added",
        description: "Your expense has been recorded successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Update an expense
  const updateExpense = useMutation({
    mutationFn: ({ id, expense }: { id: string, expense: Partial<Expense> }) => 
      expenseAPI.update(id, expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Expense Updated",
        description: "Your expense has been updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Delete an expense
  const deleteExpense = useMutation({
    mutationFn: (id: string) => expenseAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Expense Deleted",
        description: "Your expense has been deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Sync offline expenses
  const syncOfflineExpenses = useMutation({
    mutationFn: expenseAPI.syncOfflineExpenses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sync Complete",
        description: "Your offline expenses have been synced"
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: `Failed to sync offline expenses: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  return {
    expenses,
    isLoading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    syncOfflineExpenses
  };
}
