
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, ShieldCheck } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-textDark">Expense Guardian</h1>
          <p className="text-muted-foreground mt-2">Secure Family Financial Management</p>
        </div>
        
        <form className="space-y-4">
          <div>
            <Label htmlFor="username" className="flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              Username
            </Label>
            <Input 
              id="username" 
              type="text" 
              placeholder="Enter your username" 
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="flex items-center">
              <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
              Password
            </Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              className="mt-2"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Label className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2 rounded text-primary focus:ring-primary"
              />
              Remember me
            </Label>
            <a href="#" className="text-primary text-sm hover:underline">
              Forgot Password?
            </a>
          </div>
          
          <Button className="w-full bg-primary hover:bg-primary/90">
            Login
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mt-4">
              Don't have an account? 
              <a href="#" className="text-primary ml-1 hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
