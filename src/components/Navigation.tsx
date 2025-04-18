
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Users, LogOut, Wallet } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md py-3 px-6 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Wallet className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-bold text-textDark">ExpenSmart</h1>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant={isActive('/') ? "default" : "ghost"} 
            size="sm" 
            asChild
          >
            <Link to="/">
              <Home className="mr-1 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/parent') ? "default" : "ghost"} 
            size="sm" 
            asChild
          >
            <Link to="/parent">
              <Users className="mr-1 h-4 w-4" />
              Family
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/child') ? "default" : "ghost"} 
            size="sm" 
            asChild
          >
            <Link to="/child">
              <User className="mr-1 h-4 w-4" />
              Kids
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link to="/login">
              <LogOut className="mr-1 h-4 w-4" />
              Logout
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

