
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RecentExpenses = () => {
  const expenses = [
    {
      id: 1,
      date: "2025-04-18",
      description: "Grocery Shopping",
      category: "Food & Dining",
      amount: 89.99,
    },
    {
      id: 2,
      date: "2025-04-17",
      description: "Movie Tickets",
      category: "Entertainment",
      amount: 32.50,
    },
    {
      id: 3,
      date: "2025-04-17",
      description: "Gas Station",
      category: "Transportation",
      amount: 45.00,
    },
    {
      id: 4,
      date: "2025-04-16",
      description: "Internet Bill",
      category: "Bills & Utilities",
      amount: 79.99,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-textDark">Recent Expenses</h2>
      <div className="relative overflow-x-auto">
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
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.date}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecentExpenses;
