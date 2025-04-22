
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
import { PlusCircle, Save, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineExpenses, setOfflineExpenses] = useState<Expense[]>([]);

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

  // Save offline expenses to localStorage whenever they change
  useEffect(() => {
    if (offlineExpenses.length > 0) {
      localStorage.setItem('offlineExpenses', JSON.stringify(offlineExpenses));
    }
  }, [offlineExpenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toISOString().split('T')[0],
      currency,
      offlineCreated: !isOnline
    };

    if (!isOnline) {
      // Store expense locally when offline
      setOfflineExpenses(prev => [...prev, newExpense]);
      toast({
        title: "Expense Saved Offline",
        description: "Your expense has been saved locally and will sync when you're back online",
        variant: "default"
      });
    } else {
      // If we have any stored offline expenses and we're now online, we would sync them here
      if (offlineExpenses.length > 0) {
        // This would be where you'd sync with a backend
        toast({
          title: "Syncing Offline Expenses",
          description: `Syncing ${offlineExpenses.length} offline expenses`,
          variant: "default"
        });
        setOfflineExpenses([]);
        localStorage.removeItem('offlineExpenses');
      }
      
      // Here you would normally send the expense to your backend
      toast({
        title: "Expense Added",
        description: "Your expense has been recorded successfully",
        variant: "default"
      });
    }

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
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
                {getCurrencySymbol(currency)}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
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

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
          {!isOnline ? (
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
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-700 text-sm">
            {offlineExpenses.length} expense{offlineExpenses.length !== 1 ? 's' : ''} saved offline
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;
