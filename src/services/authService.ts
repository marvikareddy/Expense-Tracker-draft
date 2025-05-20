
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

// Function to clean up auth state to prevent token conflicts
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string) {
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { 
          success: false, 
          error: error.message || "Failed to sign up" 
        };
      }
      
      return { 
        success: true, 
        data: data.user
      };
    } catch (error) {
      console.error("Signup error:", error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : "An unexpected error occurred during signup" 
      };
    }
  },

  /**
   * Log in an existing user with email and password
   */
  async login(email: string, password: string) {
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try global sign out first to clear any lingering sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Global sign out failed, continuing with login");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { 
          success: false, 
          error: error.message || "Invalid login credentials" 
        };
      }
      
      return { 
        success: true,
        data: { 
          user: data.user,
          session: data.session
        } 
      };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : "An unexpected error occurred during login" 
      };
    }
  },

  /**
   * Log out the current user
   */
  async logout() {
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        return { 
          success: false, 
          error: error.message || "Failed to log out" 
        };
      }
      
      return { 
        success: true 
      };
    } catch (error) {
      console.error("Logout error:", error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : "An unexpected error occurred during logout" 
      };
    }
  },

  /**
   * Get the current user session
   */
  async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { 
          success: false, 
          error: error.message
        };
      }
      
      return { 
        success: true, 
        data: data.session 
      };
    } catch (error) {
      console.error("Get session error:", error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : "Failed to get current session" 
      };
    }
  },

  /**
   * Get the current logged in user
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      return { 
        success: true, 
        data: data.user 
      };
    } catch (error) {
      console.error("Get user error:", error);
      return { 
        success: false, 
        error: error instanceof AuthError ? error.message : "Failed to get current user" 
      };
    }
  }
};
