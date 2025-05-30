
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  ArrowRight, 
  Users, 
  PiggyBank, 
  Clock, 
  ArrowLeft,
  PlusCircle,
  CreditCard,
  Loader2,
  Activity
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { familyService } from '@/services/familyService';
import { expenseAPI, Expense } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency, getCurrencySymbol } = useCurrency();
  const { convertAmount } = useCurrencyConversion();
  const currencySymbol = getCurrencySymbol();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [childMembers, setChildMembers] = useState<any[]>([]);
  const [spendingData, setSpendingData] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [totalBudget, setTotalBudget] = useState(1000);
  const [currentSpending, setCurrentSpending] = useState(0);
  
  // Selected member for adding funds
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState('');
  
  // New goal state
  const [goalMember, setGoalMember] = useState<string>('');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Get selected family profile from localStorage
  const selectedProfile = localStorage.getItem('selectedProfile') 
    ? JSON.parse(localStorage.getItem('selectedProfile')!)
    : null;
  
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          console.log('Loading dashboard data for user:', user.id);
          
          // Load family members and filter children
          const members = await familyService.getFamilyMembers(user.id);
          console.log('Loaded family members:', members);
          
          // Convert savings amounts to current currency
          const convertedMembers = await Promise.all(
            members.map(async (member) => {
              const convertedSavings = await convertAmount(member.savings, 'USD');
              return {
                ...member,
                savings: convertedSavings
              };
            })
          );
          
          setFamilyMembers(convertedMembers);
          setChildMembers(convertedMembers.filter(member => !member.isParent));
          
          // Load expenses for spending data
          const expenses = await expenseAPI.getAll();
          console.log('Loaded expenses:', expenses);
          setRecentExpenses(expenses.slice(0, 5)); // Get 5 most recent
          
          // Process spending data for pie chart
          const categoryTotals: Record<string, number> = {};
          
          for (const expense of expenses) {
            const category = expense.category || 'Other';
            const convertedAmount = await convertAmount(expense.amount, expense.currency);
            categoryTotals[category] = (categoryTotals[category] || 0) + convertedAmount;
          }
          
          // Convert to chart format with colors
          const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];
          const chartData = Object.entries(categoryTotals).map(([name, value], index) => ({
            name,
            value,
            color: colors[index % colors.length]
          }));
          
          setSpendingData(chartData);
          
          // Calculate total spending
          const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
          setCurrentSpending(totalSpent);
          
          // Load savings goals
          const goals = await familyService.getSavingsGoals(user.id);
          console.log('Loaded savings goals:', goals);
          
          // Convert goal amounts to current currency
          const convertedGoals = await Promise.all(
            goals.map(async (goal) => {
              const convertedCurrent = await convertAmount(goal.currentAmount, 'USD');
              const convertedTarget = await convertAmount(goal.targetAmount, 'USD');
              const percentComplete = convertedTarget > 0 ? (convertedCurrent / convertedTarget) * 100 : 0;
              
              return {
                ...goal,
                currentAmount: convertedCurrent,
                targetAmount: convertedTarget,
                percentComplete: parseFloat(percentComplete.toFixed(1))
              };
            })
          );
          
          setSavingsGoals(convertedGoals);
        } catch (error) {
          console.error("Error loading dashboard data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load dashboard data."
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [user, currency, convertAmount, toast]);
  
  // Navigate back to profiles
  const handleBackToProfiles = () => {
    navigate('/profiles');
  };
  
  // Handle adding funds to a child's account
  const handleAddFunds = async () => {
    if (!selectedMember || !fundAmount || parseFloat(fundAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a family member and enter a valid amount."
      });
      return;
    }
    
    try {
      setIsAddingFunds(true);
      await familyService.addFunds(selectedMember.id, parseFloat(fundAmount));
      
      // Refresh family members to update balances
      const updatedMembers = await familyService.getFamilyMembers(user?.id || '');
      setFamilyMembers(updatedMembers);
      setChildMembers(updatedMembers.filter(member => !member.isParent));
      
      toast({
        title: "Success",
        description: `Added ${currencySymbol}${fundAmount} to ${selectedMember.name}'s account.`
      });
      
      // Reset inputs
      setSelectedMember(null);
      setFundAmount('');
    } catch (error) {
      console.error("Error adding funds:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add funds. Please try again."
      });
    } finally {
      setIsAddingFunds(false);
    }
  };
  
  // Handle creating new savings goal
  const handleCreateGoal = async () => {
    if (!goalMember || !goalName || !goalAmount || parseFloat(goalAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all fields with valid values."
      });
      return;
    }
    
    try {
      setIsAddingGoal(true);
      
      await familyService.addSavingsGoal(
        user?.id || '',
        goalMember,
        {
          name: goalName,
          targetAmount: parseFloat(goalAmount),
          currentAmount: 0,
          targetDate: goalDate,
          percentComplete: 0,
          memberId: goalMember,
          id: ''
        }
      );
      
      // Refresh savings goals
      const updatedGoals = await familyService.getSavingsGoals(user?.id || '');
      setSavingsGoals(updatedGoals);
      
      toast({
        title: "Success",
        description: `Created new savings goal for ${childMembers.find(m => m.id === goalMember)?.name}.`
      });
      
      // Reset inputs
      setGoalMember('');
      setGoalName('');
      setGoalAmount('');
      setGoalDate('');
    } catch (error) {
      console.error("Error creating savings goal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create savings goal. Please try again."
      });
    } finally {
      setIsAddingGoal(false);
    }
  };

  // Calculate budget percentage used
  const budgetUsedPercentage = totalBudget > 0 ? (currentSpending / totalBudget) * 100 : 0;

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
            <h1 className="text-3xl font-bold">Family Dashboard</h1>
          </div>
          {selectedProfile && (
            <Avatar className="w-10 h-10 bg-purple-600">
              <AvatarFallback>{selectedProfile.image}</AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700">
              <CardTitle className="text-sm font-medium text-gray-200">Family Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-6 w-24 bg-gray-700 rounded"></div>
                  <div className="h-2 w-full bg-gray-700 rounded"></div>
                  <div className="h-4 w-16 bg-gray-700 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{currencySymbol}{totalBudget.toFixed(2)}</div>
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Spent: {currencySymbol}{currentSpending.toFixed(2)}</span>
                      <span className="text-gray-400">{budgetUsedPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={budgetUsedPercentage} className="h-2 bg-gray-700" />
                  </div>
                </>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="mt-4 px-0 text-purple-400 hover:text-purple-300">
                    Edit Budget <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Update Monthly Budget</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-gray-300">Budget Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400">{currencySymbol}</span>
                        <Input 
                          id="budget" 
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7 bg-gray-700 border-gray-600 text-white"
                          value={totalBudget}
                          onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <DialogClose asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Save Changes
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700">
              <CardTitle className="text-sm font-medium text-gray-200">Family Members</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-6 w-24 bg-gray-700 rounded"></div>
                  <div className="h-4 w-32 bg-gray-700 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{familyMembers.length}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {childMembers.length} {childMembers.length === 1 ? 'child' : 'children'} · {familyMembers.length - childMembers.length} {familyMembers.length - childMembers.length === 1 ? 'parent' : 'parents'}
                  </div>
                </>
              )}
              <Button variant="ghost" size="sm" className="mt-4 px-0 text-purple-400 hover:text-purple-300" onClick={() => navigate('/add-profile')}>
                Add Member <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700">
              <CardTitle className="text-sm font-medium text-gray-200">Savings Goals</CardTitle>
              <PiggyBank className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-6 w-24 bg-gray-700 rounded"></div>
                  <div className="h-4 w-32 bg-gray-700 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{savingsGoals.length}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {savingsGoals.filter(goal => goal.percentComplete >= 100).length} completed
                  </div>
                </>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="mt-4 px-0 text-purple-400 hover:text-purple-300">
                    Create Goal <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Create New Savings Goal</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="goal-member" className="text-gray-300">Child</Label>
                      <Select value={goalMember} onValueChange={setGoalMember}>
                        <SelectTrigger id="goal-member" className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select a child" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {childMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="goal-name" className="text-gray-300">Goal Name</Label>
                      <Input 
                        id="goal-name" 
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., New Bike, Game Console"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal-amount" className="text-gray-300">Target Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400">{currencySymbol}</span>
                        <Input 
                          id="goal-amount" 
                          value={goalAmount}
                          onChange={(e) => setGoalAmount(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7 bg-gray-700 border-gray-600 text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="goal-date" className="text-gray-300">Target Date (Optional)</Label>
                      <Input 
                        id="goal-date" 
                        value={goalDate}
                        onChange={(e) => setGoalDate(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., December 2023"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <DialogClose asChild>
                      <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={handleCreateGoal}
                      disabled={isAddingGoal || !goalMember || !goalName || !goalAmount}
                    >
                      {isAddingGoal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-6">
          <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle>Family Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : childMembers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No child accounts yet</p>
                  <p className="text-sm text-gray-500 mt-2 mb-4">Add a child account to start tracking their expenses</p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => navigate('/add-profile')}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Child Account
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {childMembers.map(child => (
                    <div key={child.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4">
                          {child.image.startsWith('http') ? (
                            <AvatarImage src={child.image} />
                          ) : (
                            <AvatarFallback className="bg-purple-600 text-white">
                              {child.image}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-white">{child.name}</h3>
                          <p className="text-sm text-gray-400">Age: {child.age}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="font-medium text-white mb-1">
                          {currencySymbol}{child.savings.toFixed(2)}
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-8">
                                <CreditCard className="h-3.5 w-3.5 mr-1" /> Add Funds
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 text-white border-gray-700">
                              <DialogHeader>
                                <DialogTitle>Add Funds to {child.name}'s Account</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div>
                                  <Label htmlFor="fund-amount" className="text-gray-300">Amount</Label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">{currencySymbol}</span>
                                    <Input 
                                      id="fund-amount" 
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className="pl-7 bg-gray-700 border-gray-600 text-white"
                                      value={selectedMember?.id === child.id ? fundAmount : ''}
                                      onChange={(e) => {
                                        setSelectedMember(child);
                                        setFundAmount(e.target.value);
                                      }}
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-3">
                                <DialogClose asChild>
                                  <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700">
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button 
                                  className="bg-purple-600 hover:bg-purple-700"
                                  onClick={() => {
                                    setSelectedMember(child);
                                    handleAddFunds();
                                  }}
                                  disabled={isAddingFunds || !fundAmount || parseFloat(fundAmount) <= 0}
                                >
                                  {isAddingFunds && selectedMember?.id === child.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  Add Funds
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
              <CardTitle>Spending by Category</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : spendingData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No expenses recorded yet</p>
                  <p className="text-sm text-gray-500">Start tracking expenses to see your spending breakdown</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, '']}
                      contentStyle={{ backgroundColor: '#2D3748', borderColor: '#4A5568', color: 'white' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      layout="horizontal"
                      formatter={(value: string, entry: any) => (
                        <span style={{ color: '#E2E8F0' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle>Savings Goals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : savingsGoals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No savings goals yet</p>
                  <p className="text-sm text-gray-500 mt-2 mb-4">Create a savings goal to help your children achieve their dreams</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <PlusCircle className="h-4 w-4 mr-2" /> Create Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 text-white border-gray-700">
                      <DialogHeader>
                        <DialogTitle>Create New Savings Goal</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="goal-member-dialog" className="text-gray-300">Child</Label>
                          <Select value={goalMember} onValueChange={setGoalMember}>
                            <SelectTrigger id="goal-member-dialog" className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select a child" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              {childMembers.map(member => (
                                <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="goal-name-dialog" className="text-gray-300">Goal Name</Label>
                          <Input 
                            id="goal-name-dialog" 
                            value={goalName}
                            onChange={(e) => setGoalName(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="e.g., New Bike, Game Console"
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-amount-dialog" className="text-gray-300">Target Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400">{currencySymbol}</span>
                            <Input 
                              id="goal-amount-dialog" 
                              value={goalAmount}
                              onChange={(e) => setGoalAmount(e.target.value)}
                              type="number"
                              min="0"
                              step="0.01"
                              className="pl-7 bg-gray-700 border-gray-600 text-white"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="goal-date-dialog" className="text-gray-300">Target Date (Optional)</Label>
                          <Input 
                            id="goal-date-dialog" 
                            value={goalDate}
                            onChange={(e) => setGoalDate(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="e.g., December 2023"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <DialogClose asChild>
                          <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={handleCreateGoal}
                          disabled={isAddingGoal || !goalMember || !goalName || !goalAmount}
                        >
                          {isAddingGoal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Create Goal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {savingsGoals.map(goal => {
                    const childName = childMembers.find(m => m.id === goal.memberId)?.name || 'Child';
                    return (
                      <div key={goal.id} className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="font-medium text-white">{goal.name}</h3>
                            <p className="text-sm text-gray-400">{childName}'s goal</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-white">
                              {currencySymbol}{goal.currentAmount.toFixed(2)} / {currencySymbol}{goal.targetAmount.toFixed(2)}
                            </div>
                            <p className="text-xs text-gray-400">
                              {goal.targetDate ? `Target: ${goal.targetDate}` : 'No target date'}
                            </p>
                          </div>
                        </div>
                        <Progress 
                          value={goal.percentComplete > 100 ? 100 : goal.percentComplete} 
                          className="h-2 bg-gray-700"
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">
                          {goal.percentComplete.toFixed(1)}% complete
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : recentExpenses.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No recent activity</p>
                  <p className="text-sm text-gray-500 mt-2">Expenses will appear here as they are added</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {recentExpenses.map(expense => (
                    <div key={expense.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{expense.description}</h3>
                        <p className="text-sm text-gray-400">{expense.category} • {expense.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {currencySymbol}{expense.amount.toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-400">{expense.currency}</p>
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

export default ParentDashboard;
