
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, ShieldCheck } from 'lucide-react';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to clean up auth state
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Sign out before auth failed, continuing anyway");
      }
      
      let result;
      if (isSignUp) {
        result = await authService.signUp(email, password);
        if (result.success) {
          toast({
            title: "Account created successfully",
            description: "Please check your email to verify your account."
          });
          setIsSignUp(false); // Switch to login form after successful signup
        } else {
          toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description: result.error || "Failed to create account."
          });
        }
      } else {
        result = await authService.login(email, password);
        if (result.success) {
          toast({
            title: "Login successful",
            description: "Welcome back!"
          });
          // Force page reload to ensure fresh state
          window.location.href = '/';
        } else {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: result.error || "Invalid email or password."
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again."
      });
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-textDark">ExpenSmart</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your expenses with ease
          </p>
        </div>
        
        <form className="space-y-4" onSubmit={handleAuth}>
          <div>
            <Label htmlFor="email" className="flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input id="email" type="email" placeholder="Enter your email" className="mt-2" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div>
            <Label htmlFor="password" className="flex items-center">
              <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
              Password
            </Label>
            <Input id="password" type="password" placeholder="Enter your password" className="mt-2" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          
          {!isSignUp && <div className="flex justify-between items-center">
              <Label className="flex items-center">
                <input type="checkbox" className="mr-2 rounded text-primary focus:ring-primary" />
                Remember me
              </Label>
              <a href="#" className="text-primary text-sm hover:underline">
                Forgot Password?
              </a>
            </div>}
          
          <Button className="w-full bg-primary hover:bg-primary/90" type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mt-4">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button type="button" className="text-primary ml-1 hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>;
};

export default Login;
