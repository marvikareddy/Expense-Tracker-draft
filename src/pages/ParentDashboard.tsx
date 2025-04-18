
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, User, CreditCard, PiggyBank, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ParentDashboard = () => {
  // Sample data for child accounts
  const children = [
    { id: 1, name: "Emma", age: 10, savings: 125, allowance: 50, image: "👧" },
    { id: 2, name: "Jake", age: 14, savings: 230, allowance: 75, image: "👦" }
  ];
  
  // Sample data for spending chart
  const spendingData = [
    { name: 'Education', value: 400, color: '#9b87f5' },
    { name: 'Food', value: 300, color: '#F2FCE2' },
    { name: 'Entertainment', value: 200, color: '#FEC6A1' },
    { name: 'Savings', value: 500, color: '#D3E4FD' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-textDark">Family Dashboard</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Family Member
          </Button>
        </div>
        
        {/* Family Financial Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Family Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                2 parents, 2 children
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Allowances</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$125.00</div>
              <p className="text-xs text-muted-foreground">
                Per week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$355.00</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Children Accounts & Spending Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Children Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Children Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.map(child => (
                  <div key={child.id} className="flex items-center p-4 border rounded-lg">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-xl mr-4">
                      {child.image}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{child.name}, {child.age}</h3>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Allowance: ${child.allowance}/week</span>
                        <span>Savings: ${child.savings}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Child Account
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Family Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Family Spending</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer 
                config={{
                  Education: { color: '#9b87f5' },
                  Food: { color: '#F2FCE2' },
                  Entertainment: { color: '#FEC6A1' },
                  Savings: { color: '#D3E4FD' },
                }}
              >
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Family Savings Goals */}
        <div className="mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Family Savings Goals</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Goal
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <PiggyBank className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-semibold">Summer Vacation</h3>
                    </div>
                    <span className="text-sm font-medium">$1,200 / $3,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">40% complete - Target: August 2025</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <PiggyBank className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-semibold">New Computer</h3>
                    </div>
                    <span className="text-sm font-medium">$800 / $1,200</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">67% complete - Target: June 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
