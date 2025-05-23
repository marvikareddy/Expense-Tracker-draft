
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, ShieldCheck } from 'lucide-react';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "@/components/ui/motion";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/profiles');
      }
    };
    checkSession();
  }, [navigate]);

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
          // Navigate to profile selection
          navigate('/profiles');
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

  return (
    <motion.div 
      className="min-h-screen bg-[#141414] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto h-16 w-16 text-purple-500 mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">ExpenSmart</h1>
          <p className="text-gray-400">
            Family-focused financial management
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleAuth}>
          <div>
            <Label htmlFor="email" className="flex items-center text-gray-300">
              <User className="mr-2 h-4 w-4 text-gray-400" />
              Email
            </Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="flex items-center text-gray-300">
              <Lock className="mr-2 h-4 w-4 text-gray-400" />
              Password
            </Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={6} 
            />
          </div>
          
          {!isSignUp && (
            <div className="flex justify-between items-center">
              <Label className="flex items-center text-gray-300">
                <input 
                  type="checkbox" 
                  className="mr-2 rounded text-purple-600 focus:ring-purple-500 bg-gray-700 border-gray-600" 
                />
                Remember me
              </Label>
              <a href="#" className="text-purple-400 text-sm hover:underline">
                Forgot Password?
              </a>
            </div>
          )}
          
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 py-5" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-400 mt-4">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button 
                type="button" 
                className="text-purple-400 ml-1 hover:underline" 
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Login;
