
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Users, LogOut, Wallet, Wifi, WifiOff, Globe } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md py-3 px-6 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Wallet className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-bold text-textDark">ExpenSmart</h1>
          <div className="ml-3 flex items-center">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-xs hidden sm:inline">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-xs hidden sm:inline">Offline Mode</span>
              </div>
            )}
          </div>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">USD ($)</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">EUR (€)</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">GBP (£)</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">JPY (¥)</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">INR (₹)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
