import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PlusCircle, Save, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/contexts/AuthContext';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: string;
  offlineCreated?: boolean;
}

const ExpenseForm = () => {
  const { toast } = useToast();
  const { currency } = useCurrency();
  const { createExpense, syncOfflineExpenses } = useExpenses();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currency);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineExpenses, setOfflineExpenses] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Update selected currency when global currency changes
  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];

  const categories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Other"
  ];
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load any offline expenses from localStorage
    const storedExpenses = localStorage.getItem('offlineExpenses');
    if (storedExpenses) {
      setOfflineExpenses(JSON.parse(storedExpenses));
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline expenses when going back online
  useEffect(() => {
    const syncExpensesWhenOnline = async () => {
      if (isOnline && offlineExpenses.length > 0 && user) {
        try {
          setIsSyncing(true);
          await syncOfflineExpenses.mutateAsync();
          setOfflineExpenses([]);
          localStorage.removeItem('offlineExpenses');
          toast({
            title: "Sync Complete",
            description: "Your offline expenses have been synced"
          });
        } catch (error) {
          console.error("Failed to sync expenses:", error);
          toast({
            title: "Sync Failed",
            description: "Could not sync your offline expenses. Please try again later."
          });
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (isOnline && user) {
      syncExpensesWhenOnline();
    }
  }, [isOnline, user, offlineExpenses.length, syncOfflineExpenses, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createExpense.mutateAsync({
        amount: parseFloat(amount),
        category,
        description,
        date: new Date().toISOString().split('T')[0],
        currency: selectedCurrency
      });
      
      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
    } catch (error) {
      console.error("Error submitting expense:", error);
      
      if (!isOnline) {
        // Keep track of offline expenses count
        const storedExpenses = JSON.parse(localStorage.getItem('offlineExpenses') || '[]');
        setOfflineExpenses(storedExpenses);
      }
    }
  };

  const handleSyncClick = async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Please connect to the internet to sync expenses",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSyncing(true);
      await syncOfflineExpenses.mutateAsync();
      setOfflineExpenses([]);
      toast({
        title: "Sync Complete",
        description: "Your offline expenses have been synced"
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not sync your offline expenses. Please try again later."
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '$';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-textDark">Add New Expense</h2>
        {!isOnline && (
          <div className="flex items-center text-amber-600">
            <WifiOff className="h-4 w-4 mr-1" />
            <span className="text-xs">Offline Mode</span>
          </div>
        )}
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                type="number"
                id="amount"
                placeholder="0.00"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-500">
                {getCurrencySymbol(selectedCurrency)}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={createExpense.isPending}
        >
          {createExpense.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : !isOnline ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Offline
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </>
          )}
        </Button>
      </form>
      
      {offlineExpenses.length > 0 && (
        <div className="mt-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-amber-700 text-sm">
                {offlineExpenses.length} expense{offlineExpenses.length !== 1 ? 's' : ''} saved offline
              </p>
              {isOnline && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSyncClick}
                  disabled={isSyncing}
                  className="text-xs h-7 px-2"
                >
                  {isSyncing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;
