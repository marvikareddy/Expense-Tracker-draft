
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  currency: string;
  date: string;
  user_id?: string;
}

export const expenseAPI = {
  // Get all expenses for the current user
  getAll: async (): Promise<Expense[]> => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching expenses:", error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      // If there's an error (e.g., offline), try to get data from localStorage
      const localExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
      return localExpenses;
    }
  },

  // Create a new expense
  create: async (expense: Omit<Expense, "id">): Promise<Expense> => {
    try {
      const newExpense = {
        ...expense,
        id: uuidv4(), // Generate a UUID for the expense
      };

      const { data, error } = await supabase
        .from("expenses")
        .insert([newExpense])
        .select()
        .single();

      if (error) {
        console.error("Error creating expense:", error);
        // Save locally if there's an error (e.g., offline)
        const localExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
        const offlineExpense = { ...newExpense, offlineCreated: true };
        localStorage.setItem("expenses", JSON.stringify([offlineExpense, ...localExpenses]));
        
        // Also add to offline queue
        const offlineQueue = JSON.parse(localStorage.getItem("offlineExpenses") || "[]");
        localStorage.setItem("offlineExpenses", JSON.stringify([...offlineQueue, offlineExpense]));
        
        return offlineExpense;
      }

      return data;
    } catch (error) {
      console.error("Failed to create expense:", error);
      throw error;
    }
  },

  // Update an expense
  update: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update(expense)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating expense:", error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Failed to update expense:", error);
      throw error;
    }
  },

  // Delete an expense
  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting expense:", error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Failed to delete expense:", error);
      throw error;
    }
  },

  // Sync offline expenses to Supabase
  syncOfflineExpenses: async (): Promise<void> => {
    try {
      const offlineExpenses = JSON.parse(localStorage.getItem("offlineExpenses") || "[]");
      
      if (offlineExpenses.length === 0) {
        return;
      }

      // Remove user_id as it will be automatically set by RLS
      const cleanedExpenses = offlineExpenses.map(({ user_id, offlineCreated, ...expense }: any) => expense);
      
      const { error } = await supabase
        .from("expenses")
        .insert(cleanedExpenses);

      if (error) {
        console.error("Error syncing offline expenses:", error);
        throw new Error(error.message);
      }

      // Clear offline expenses after successful sync
      localStorage.removeItem("offlineExpenses");
    } catch (error) {
      console.error("Failed to sync offline expenses:", error);
      throw error;
    }
  }
};
