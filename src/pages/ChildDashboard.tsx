import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  PiggyBank, 
  Gift, 
  Loader2, 
  ArrowLeft,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { familyService } from '@/services/familyService';
import { rewardsService, Reward } from '@/services/rewardsService';

interface ChildExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

const ChildDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCurrencySymbol } = useCurrency();
  const { toast } = useToast();
  const currencySymbol = getCurrencySymbol();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pocketMoney, setPocketMoney] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState({ current: 0, target: 0, item: '' });
  const [expenses, setExpenses] = useState<ChildExpense[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  
  // New expense form state
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Entertainment'
  });
  
  // Get selected family profile from localStorage
  const selectedProfile = localStorage.getItem('selectedProfile') 
    ? JSON.parse(localStorage.getItem('selectedProfile')!)
    : null;
  
  useEffect(() => {
    const loadChildData = async () => {
      if (user && selectedProfile) {
        setIsLoading(true);
        try {
          // Load fresh profile data from database
          const familyMembers = await familyService.getFamilyMembers(user.id);
          const currentProfile = familyMembers.find(member => member.id === selectedProfile.id);
          
          if (currentProfile) {
            // Set pocket money from database
            setPocketMoney(currentProfile.allowance || 0);
            
            // Set savings goal from profile
            setSavingsGoal({
              current: currentProfile.savings || 0,
              target: 100, // Default target
              item: 'My Goal'
            });
            
            // Update selectedProfile in localStorage with fresh data
            localStorage.setItem('selectedProfile', JSON.stringify(currentProfile));
          } else {
            // Profile not found, redirect to profiles
            navigate('/profiles');
            return;
          }
          
          // Load rewards
          const memberRewards = rewardsService.getRewards(selectedProfile.id);
          setRewards(memberRewards);
          
          // Load expenses from localStorage
          const expenseKey = `expenses_${selectedProfile.id}`;
          const storedExpenses = localStorage.getItem(expenseKey);
          if (storedExpenses) {
            setExpenses(JSON.parse(storedExpenses));
          } else {
            setExpenses([]);
          }
        } catch (error) {
          console.error("Error loading child data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load data. Please try again."
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no profile selected, redirect to profiles
        navigate('/profiles');
      }
    };
    
    loadChildData();
  }, [user, selectedProfile?.id, navigate, toast]);
  
  // Navigate back to profiles
  const handleBackToProfiles = () => {
    navigate('/profiles');
  };

  // Calculate savings percentage
  const savingsPercentage = savingsGoal.target > 0 
    ? (savingsGoal.current / savingsGoal.target * 100).toFixed(1) 
    : '0';
  
  // Handle new expense submission
  const handleSubmitExpense = async () => {
    if (!newExpense.description || !newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields with valid values."
      });
      return;
    }
    
    const expenseAmount = parseFloat(newExpense.amount);
    
    // Check if user has enough pocket money
    if (expenseAmount > pocketMoney) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `You don't have enough pocket money for this expense. You have ${currencySymbol}${pocketMoney.toFixed(2)} available.`
      });
      return;
    }
    
    try {
      setIsAddingExpense(true);
      
      // Add to expenses list
      const newExpenseItem: ChildExpense = {
        id: Date.now().toString(),
        description: newExpense.description,
        amount: expenseAmount,
        category: newExpense.category,
        date: new Date().toISOString().split('T')[0]
      };
      
      const updatedExpenses = [newExpenseItem, ...expenses];
      setExpenses(updatedExpenses);
      
      // Store expenses in localStorage
      const expenseKey = `expenses_${selectedProfile.id}`;
      localStorage.setItem(expenseKey, JSON.stringify(updatedExpenses));
      
      // Deduct from pocket money
      const newPocketMoney = pocketMoney - expenseAmount;
      setPocketMoney(newPocketMoney);
      
      // Update the profile's allowance in the database
      await familyService.updateFamilyMember(selectedProfile.id, {
        allowance: newPocketMoney
      });
      
      // Update localStorage profile
      const updatedProfile = { ...selectedProfile, allowance: newPocketMoney };
      localStorage.setItem('selectedProfile', JSON.stringify(updatedProfile));
      
      // Reset form
      setNewExpense({
        description: '',
        amount: '',
        category: 'Entertainment'
      });
      
      toast({
        title: "Success",
        description: "Expense added and pocket money updated!"
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add expense. Please try again."
      });
    } finally {
      setIsAddingExpense(false);
    }
  };

  // Handle reward redemption
  const handleRedeemReward = (rewardId: string) => {
    try {
      rewardsService.removeReward(selectedProfile.id, rewardId);
      const updatedRewards = rewardsService.getRewards(selectedProfile.id);
      setRewards(updatedRewards);
      
      toast({
        title: "Reward Redeemed!",
        description: "Enjoy your reward!"
      });
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to redeem reward. Please try again."
      });
    }
  };

  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">No profile selected</p>
          <Button onClick={() => navigate('/profiles')}>
            Select Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="container py-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2 text-gray-300 hover:text-white"
              onClick={handleBackToProfiles}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> 
              Back to Profiles
            </Button>
            <h1 className="text-3xl font-bold">{selectedProfile.name}'s Wallet</h1>
          </div>
          <Avatar className="w-10 h-10 bg-purple-600">
            <AvatarFallback className="text-2xl">{selectedProfile.image || '👤'}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700">
              <CardTitle className="text-sm font-medium text-gray-200">Pocket Money</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <Skeleton className="h-6 w-24 bg-gray-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{currencySymbol}{pocketMoney.toFixed(2)}</div>
                  <p className="text-xs text-gray-400">
                    Available to spend
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700">
              <CardTitle className="text-sm font-medium text-gray-200">Savings Goal</CardTitle>
              <PiggyBank className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <Skeleton className="h-6 w-24 bg-gray-700" />
              ) : savingsGoal.target <= 0 ? (
                <div className="text-gray-400 text-sm">No savings goal set yet</div>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{currencySymbol}{savingsGoal.current.toFixed(2)}</span>
                    <span className="text-gray-300">{currencySymbol}{savingsGoal.target.toFixed(2)}</span>
                  </div>
                  <Progress value={parseFloat(savingsPercentage)} className="h-2 bg-gray-700" />
                  <p className="text-xs text-gray-400 mt-2">
                    {savingsPercentage}% saved for {savingsGoal.item}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700">
              <CardTitle className="text-sm font-medium text-gray-200">Rewards</CardTitle>
              <Gift className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <Skeleton className="h-6 w-24 bg-gray-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{rewards.length} Available</div>
                  <p className="text-xs text-gray-400">
                    {rewards.length > 0 ? 'Great job saving!' : 'Keep saving to earn rewards!'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Expenses</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <PlusCircle className="h-4 w-4 mr-1" /> New Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 text-white border-gray-700">
                    <DialogHeader>
                      <DialogTitle>Add New Expense</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="description" className="text-gray-300">Description</Label>
                        <Input 
                          id="description" 
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="What did you spend on?"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount" className="text-gray-300">Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400">{currencySymbol}</span>
                          <Input 
                            id="amount" 
                            className="bg-gray-700 border-gray-600 text-white pl-7"
                            placeholder="0.00"
                            type="number"
                            min="0"
                            step="0.01"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-gray-300">Category</Label>
                        <Select 
                          value={newExpense.category} 
                          onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                        >
                          <SelectTrigger id="category" className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Toys">Toys</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <DialogClose asChild>
                        <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700" 
                          onClick={handleSubmitExpense}
                          disabled={isAddingExpense || !newExpense.description || !newExpense.amount || parseFloat(newExpense.amount) <= 0}
                        >
                          {isAddingExpense ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Add Expense
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No expenses yet</p>
                  <p className="text-sm text-gray-500">Add your first expense to track your spending</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Description</TableHead>
                      <TableHead className="text-gray-400">Category</TableHead>
                      <TableHead className="text-right text-gray-400">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map(expense => (
                      <TableRow key={expense.id} className="border-gray-700">
                        <TableCell className="text-gray-300">{expense.date}</TableCell>
                        <TableCell className="text-gray-300">{expense.description}</TableCell>
                        <TableCell className="text-gray-300">{expense.category}</TableCell>
                        <TableCell className="text-right text-gray-300">
                          {currencySymbol}{expense.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle>My Rewards</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {rewards.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No rewards available</p>
                  <p className="text-sm text-gray-500">Keep saving to earn rewards!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {rewards.map(reward => (
                    <div key={reward.id} className="p-4 hover:bg-gray-750 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-gray-200 font-medium">{reward.title}</h4>
                          <p className="text-sm text-gray-400">{reward.description}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => handleRedeemReward(reward.id)}
                        >
                          Redeem
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;
