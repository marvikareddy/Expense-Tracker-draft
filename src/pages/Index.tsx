
import Navigation from "@/components/Navigation";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseSummary from "@/components/ExpenseSummary";
import RecentExpenses from "@/components/RecentExpenses";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container py-4">
        <h1 className="text-3xl font-bold mb-6 text-textDark">Expense Tracker</h1>
        
        <div className="mb-6">
          <ExpenseSummary />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ExpenseForm />
          <RecentExpenses />
        </div>
      </div>
    </div>
  );
};

export default Index;
