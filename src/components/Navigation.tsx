
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  User, 
  Users, 
  LogOut, 
  Wifi, 
  WifiOff, 
  Globe, 
  ShieldCheck 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { authService } from '@/services/authService';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [user, setUser] = useState(null);
  
  // Get selected family profile from localStorage
  const selectedProfile = localStorage.getItem('selectedProfile') 
    ? JSON.parse(localStorage.getItem('selectedProfile')!)
    : null;
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up auth state listener
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    // Check for existing session
    const checkSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
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
    window.dispatchEvent(new CustomEvent('currencyChanged', {
      detail: currencyCode
    }));
  };
  
  const handleLogout = async () => {
    try {
      const {
        success,
        error
      } = await authService.logout();
      if (success) {
        // Clear selected profile
        localStorage.removeItem('selectedProfile');
        
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account."
        });
        
        // Navigate to login
        navigate('/login');
      } else {
        toast({
          variant: "destructive",
          title: "Logout Failed",
          description: error || "Failed to log out. Please try again."
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "An unexpected error occurred during logout."
      });
    }
  };
  
  const handleProfileClick = () => {
    navigate('/profiles');
  };
  
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];
  
  return (
    <nav className="bg-gray-800 border-b border-gray-700 py-3 px-6 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6 text-purple-500" />
          <h1 className="text-xl font-bold text-white">ExpenSmart</h1>
          <div className="ml-3 flex items-center">
            {isOnline ? 
              <div className="flex items-center text-green-500">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-xs hidden sm:inline">Online</span>
              </div> : 
              <div className="flex items-center text-amber-500">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-xs hidden sm:inline">Offline Mode</span>
              </div>
            }
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user && (
            <>
              {selectedProfile?.isParent ? (
                <>
                  <Button variant={isActive('/parent') ? "default" : "ghost"} size="sm" className="min-w-24 justify-center bg-transparent text-white hover:bg-gray-700 border-gray-700" asChild>
                    <Link to="/parent">
                      <Users className="mr-1 h-4 w-4" />
                      Family
                    </Link>
                  </Button>
                  
                  <Button variant={isActive('/child') ? "default" : "ghost"} size="sm" className="min-w-24 justify-center bg-transparent text-white hover:bg-gray-700 border-gray-700" asChild>
                    <Link to="/child">
                      <User className="mr-1 h-4 w-4" />
                      Kids
                    </Link>
                  </Button>
                </>
              ) : (
                <Button variant={isActive('/child') ? "default" : "ghost"} size="sm" className="min-w-24 justify-center bg-transparent text-white hover:bg-gray-700 border-gray-700" asChild>
                  <Link to="/child">
                    <Home className="mr-1 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-transparent text-white border-gray-700">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
              {currencies.map(currency => (
                <DropdownMenuItem 
                  key={currency.code} 
                  onClick={() => handleCurrencyChange(currency.code)} 
                  className="cursor-pointer hover:bg-gray-700"
                >
                  {currency.symbol} {currency.code} - {currency.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent text-white border-gray-700"
                onClick={handleProfileClick}
              >
                <Avatar className="w-5 h-5 mr-2">
                  <AvatarFallback className="bg-purple-600 text-xs">
                    {selectedProfile?.image || '👤'}
                  </AvatarFallback>
                </Avatar>
                {selectedProfile?.name || 'Profile'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent text-white border-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="bg-transparent text-white border-gray-700" asChild>
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
