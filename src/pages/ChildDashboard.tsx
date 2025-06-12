
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, PiggyBank, Gift, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { childService, ChildExpense } from '@/services/childService';
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

const ChildDashboard = () => {
  const { user } = useAuth();
  const { getCurrencySymbol } = useCurrency();
  const currencySymbol = getCurrencySymbol();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pocketMoney, setPocketMoney] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState({ current: 0, target: 0, item: '' });
  const [rewards, setRewards] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<ChildExpense[]>([]);
  
  useEffect(() => {
    const loadChildData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // For now we use a mock childId
          const childId = '1';
          const [pocket, savings, rewardsList, expensesList] = await Promise.all([
            childService.getPocketMoney(childId),
            childService.getSavingsGoal(childId),
            childService.getRewards(childId),
            childService.getExpenses(childId)
          ]);
          
          setPocketMoney(pocket);
          setSavingsGoal(savings);
          setRewards(rewardsList);
          setExpenses(expensesList);
        } catch (error) {
          console.error("Error loading child data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadChildData();
  }, [user]);

  // Calculate savings percentage
  const savingsPercentage = savingsGoal.target > 0 
    ? (savingsGoal.current / savingsGoal.target * 100).toFixed(1) 
    : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container py-4">
        <h1 className="text-3xl font-bold mb-6 text-textDark">Emma's Wallet</h1>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pocket Money</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{currencySymbol}{pocketMoney.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Weekly allowance
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {currencySymbol}{savingsGoal.current.toFixed(2)} / {currencySymbol}{savingsGoal.target.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {savingsPercentage}% saved for {savingsGoal.item}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rewards</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{rewards.length} Available</div>
                  <p className="text-xs text-muted-foreground">
                    Good job saving!
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-textDark">Recent Expenses</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : expenses.length === 0 ? (
              <p className="text-muted-foreground">No recent expenses</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="text-right">
                        {currencySymbol}{expense.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;
