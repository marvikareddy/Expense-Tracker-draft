
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, PiggyBank, Gift } from 'lucide-react';

const ChildDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-textDark">Emma's Wallet</h1>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pocket Money</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$50.00</div>
              <p className="text-xs text-muted-foreground">
                Weekly allowance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$125.00 / $200.00</div>
              <p className="text-xs text-muted-foreground">
                62.5% saved for new bike
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rewards</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Available</div>
              <p className="text-xs text-muted-foreground">
                Good job saving!
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-textDark">Recent Expenses</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Placeholder for recent expenses table */}
            <p className="text-muted-foreground">No recent expenses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;
