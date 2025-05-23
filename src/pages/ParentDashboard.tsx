
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PiggyBank, 
  DollarSign, 
  Plus, 
  Edit, 
  Users, 
  TrendingUp,
  ArrowLeft,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { familyService, FamilyMember, SavingsGoal } from '@/services/familyService';
import { childService, ChildExpense } from '@/services/childService';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCurrencySymbol } = useCurrency();
  const currencySymbol = getCurrencySymbol();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [expenses, setExpenses] = useState<ChildExpense[]>([]);
  const [spendingData, setSpendingData] = useState<any[]>([]);

  // Get selected family profile from localStorage
  const selectedProfile = localStorage.getItem('selectedProfile') 
    ? JSON.parse(localStorage.getItem('selectedProfile')!)
    : null;

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Fetch all data
          const members = await familyService.getFamilyMembers(user.id);
          const goals = await familyService.getSavingsGoals(user.id);
          const spending = await familyService.getSpendingData(user.id);
          
          setFamilyMembers(members);
          setSavingsGoals(goals);
          setSpendingData(spending);
          
          // Filter out children
          const childrenOnly = members.filter(member => !member.isParent);
          setChildren(childrenOnly);
          
          // Set the first child as selected if any exist
          if (childrenOnly.length > 0 && !selectedChild) {
            setSelectedChild(childrenOnly[0].id);
            const childExpenses = await childService.getExpenses(childrenOnly[0].id);
            setExpenses(childExpenses);
          }
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [user]);

  // Handle child selection change
  const handleChildChange = async (childId: string) => {
    setSelectedChild(childId);
    try {
      const childExpenses = await childService.getExpenses(childId);
      setExpenses(childExpenses);
    } catch (error) {
      console.error("Error loading child expenses:", error);
    }
  };

  // Get goal for a specific member
  const getMemberGoal = (memberId: string) => {
    return savingsGoals.find(goal => goal.memberId === memberId);
  };

  // Navigate back to profiles
  const handleBackToProfiles = () => {
    navigate('/profiles');
  };

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
            <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">Welcome, {selectedProfile?.name || 'Parent'}</span>
            <Avatar className="w-10 h-10 bg-purple-600">
              <AvatarFallback>{selectedProfile?.image || '👤'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700">
              <CardTitle className="text-sm font-medium text-gray-200">Family Members</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold mb-2">{familyMembers.length}</div>
              <div className="flex -space-x-3">
                {familyMembers.map((member, index) => (
                  <Avatar key={member.id} className={`w-9 h-9 border-2 ${member.isParent ? 'border-purple-500' : 'border-blue-400'}`}>
                    <AvatarFallback className="bg-gray-700 text-white">{member.image}</AvatarFallback>
                  </Avatar>
                ))}
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-dashed border-gray-600 cursor-pointer hover:border-purple-500 transition-colors">
                      <Plus className="h-4 w-4 text-gray-400" />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 text-white border-gray-700">
                    <DialogHeader>
                      <DialogTitle>Add Family Member</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => navigate('/add-profile')}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Profile
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700">
              <CardTitle className="text-sm font-medium text-gray-200">Total Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {currencySymbol}{familyMembers.reduce((total, member) => total + member.savings, 0).toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {children.length} active saving goals
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700">
              <CardTitle className="text-sm font-medium text-gray-200">Monthly Allowances</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {currencySymbol}{children.reduce((total, child) => total + child.allowance, 0).toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Total monthly budget for kids
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="children" className="mt-8">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="spending">Family Spending</TabsTrigger>
            <TabsTrigger value="goals">Savings Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="children" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Child</h3>
                {children.map((child) => (
                  <Card 
                    key={child.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedChild === child.id 
                        ? 'bg-purple-900 border-purple-500' 
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                    }`}
                    onClick={() => handleChildChange(child.id)}
                  >
                    <CardContent className="flex items-center p-4">
                      <Avatar className="w-12 h-12 mr-4">
                        <AvatarFallback className="bg-purple-600 text-xl">{child.image}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{child.name}</h4>
                        <p className="text-sm text-gray-400">Age: {child.age}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {selectedChild && (
                <>
                  <Card className="bg-gray-800 border-gray-700 md:col-span-2">
                    <CardHeader className="border-b border-gray-700">
                      <CardTitle>
                        {children.find(c => c.id === selectedChild)?.name}'s Dashboard
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-700 p-4 rounded-md">
                          <h4 className="text-sm text-gray-300 mb-1">Pocket Money</h4>
                          <div className="text-2xl font-bold">
                            {currencySymbol}{children.find(c => c.id === selectedChild)?.allowance.toFixed(2)}/week
                          </div>
                          <Button size="sm" variant="outline" className="mt-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white">
                            <Edit className="h-3 w-3 mr-1" /> Adjust
                          </Button>
                        </div>
                        
                        <div className="bg-gray-700 p-4 rounded-md">
                          <h4 className="text-sm text-gray-300 mb-1">Savings</h4>
                          <div className="text-2xl font-bold">
                            {currencySymbol}{children.find(c => c.id === selectedChild)?.savings.toFixed(2)}
                          </div>
                          <Button size="sm" variant="outline" className="mt-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white">
                            <Plus className="h-3 w-3 mr-1" /> Add Funds
                          </Button>
                        </div>
                      </div>
                      
                      {getMemberGoal(selectedChild) && (
                        <div className="mb-6">
                          <h4 className="text-sm text-gray-300 mb-2">Savings Goal: {getMemberGoal(selectedChild)?.name}</h4>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{currencySymbol}{getMemberGoal(selectedChild)?.currentAmount.toFixed(2)}</span>
                            <span>{currencySymbol}{getMemberGoal(selectedChild)?.targetAmount.toFixed(2)}</span>
                          </div>
                          <Progress value={getMemberGoal(selectedChild)?.percentComplete || 0} className="h-2 bg-gray-700" />
                          <div className="mt-1 text-xs text-gray-400">
                            {getMemberGoal(selectedChild)?.percentComplete.toFixed(0)}% towards goal
                          </div>
                        </div>
                      )}
                      
                      <h4 className="text-sm text-gray-300 mb-2">Recent Expenses</h4>
                      {expenses.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-700">
                              <TableHead className="text-gray-400">Date</TableHead>
                              <TableHead className="text-gray-400">Description</TableHead>
                              <TableHead className="text-right text-gray-400">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {expenses.slice(0, 5).map((expense) => (
                              <TableRow key={expense.id} className="border-gray-700">
                                <TableCell className="text-gray-300">{expense.date}</TableCell>
                                <TableCell className="text-gray-300">{expense.description}</TableCell>
                                <TableCell className="text-right text-gray-300">
                                  {currencySymbol}{expense.amount.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-gray-400 text-sm">No expenses recorded</p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="spending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700 md:col-span-2">
                <CardHeader className="border-b border-gray-700">
                  <CardTitle>Family Spending Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={spendingData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {spendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${currencySymbol}${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <CardTitle>Top Expenses</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {spendingData
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 4)
                      .map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                            <span className="text-gray-300">{category.name}</span>
                          </div>
                          <span className="font-medium">{currencySymbol}{category.value.toFixed(2)}</span>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {savingsGoals.map((goal) => {
                const child = children.find(c => c.id === goal.memberId);
                return (
                  <Card key={goal.id} className="bg-gray-800 border-gray-700">
                    <CardHeader className="border-b border-gray-700">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{goal.name}</CardTitle>
                        {child && (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-400 mr-2">{child.name}</span>
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-purple-600 text-xs">{child.image}</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>{currencySymbol}{goal.currentAmount.toFixed(2)}</span>
                        <span>{currencySymbol}{goal.targetAmount.toFixed(2)}</span>
                      </div>
                      <Progress value={goal.percentComplete} className="h-2 bg-gray-700" />
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-400">{goal.percentComplete.toFixed(0)}% completed</span>
                        <span className="text-gray-400">Target: {goal.targetDate}</span>
                      </div>
                      <Button size="sm" className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-3 w-3 mr-1" /> Add Funds
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              
              <Card className="bg-gray-800 border-gray-700 flex flex-col items-center justify-center p-6 border-dashed">
                <PlusCircle className="h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-gray-400 mb-2">Add New Saving Goal</h3>
                <Button variant="outline" className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-700">
                  <Plus className="h-4 w-4 mr-1" /> Create Goal
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;
