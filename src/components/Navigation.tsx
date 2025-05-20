
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Users, LogOut, Wallet, Wifi, WifiOff, Globe } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authService } from '@/services/authService';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkSession();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      subscription?.unsubscribe();
    };
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleCurrencyChange = (currencyCode: string) => {
    localStorage.setItem('selectedCurrency', currencyCode);
    // Dispatch an event to notify other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currencyCode }));
  };

  const handleLogout = async () => {
    try {
      const { success, error } = await authService.logout();
      
      if (success) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
        // Force page reload to clear any state
        window.location.href = '/login';
      } else {
        toast({
          variant: "destructive",
          title: "Logout Failed",
          description: error || "Failed to log out. Please try again.",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "An unexpected error occurred during logout.",
      });
    }
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];

  return (
    <nav className="bg-white shadow-md py-3 px-6 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Wallet className="h-6 w-6 text-primary" />
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
        
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Button 
                variant={isActive('/') ? "default" : "ghost"} 
                size="sm" 
                className="min-w-24 justify-center"
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
                className="min-w-24 justify-center" 
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
                className="min-w-24 justify-center" 
                asChild
              >
                <Link to="/child">
                  <User className="mr-1 h-4 w-4" />
                  Kids
                </Link>
              </Button>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currencies.map(currency => (
                <DropdownMenuItem 
                  key={currency.code}
                  className="cursor-pointer"
                  onClick={() => handleCurrencyChange(currency.code)}
                >
                  {currency.symbol} {currency.code} - {currency.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-1 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link to="/login">
                <User className="mr-1 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
