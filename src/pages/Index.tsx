
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseSummary from "@/components/ExpenseSummary";
import RecentExpenses from "@/components/RecentExpenses";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-textDark">Expense Tracker</h1>
        
        <div className="mb-8">
          <ExpenseSummary />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <ExpenseForm />
          <RecentExpenses />
        </div>
      </div>
    </div>
  );
};

export default Index;
