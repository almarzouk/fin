export type AllocationCategory =
  | "fixed"
  | "investment"
  | "savings"
  | "variable";

export type ExpenseType = "necessary" | "unnecessary" | "investment";

export type AlertType = "warning" | "info" | "danger";

export type Locale = "ar" | "de";

export interface Allocation {
  label: string;
  amount: number;
  category: AllocationCategory;
}

export interface SalaryConfigDTO {
  _id: string;
  amount: number;
  currency: string;
  month: string;
  allocations: Allocation[];
  createdAt: string;
}

export interface ExpenseDTO {
  _id: string;
  title: string;
  amount: number;
  category: string;
  type: ExpenseType;
  date: string;
  note?: string;
  isWarning: boolean;
  createdAt: string;
}

export interface InvestmentDTO {
  _id: string;
  title: string;
  amount: number;
  currentValue: number;
  type: string;
  startDate: string;
  note?: string;
  createdAt: string;
}

export interface AlertDTO {
  _id: string;
  title: string;
  message: string;
  type: AlertType;
  category: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalSalary: number;
  totalAllocated: number;
  totalExpenses: number;
  totalInvested: number;
  remainingBalance: number;
  unnecessaryExpensesCount: number;
  unnecessaryExpensesTotal: number;
  expensesByCategory: { category: string; total: number }[];
  monthlyTrend: { month: string; total: number }[];
  currency: string;
  recentExpenses: ExpenseDTO[];
  unreadAlerts: AlertDTO[];
  healthScore: FinancialHealthScore;
}

export interface FinancialHealthScore {
  total: number; // 0-100
  breakdown: {
    investment: number;   // 0-25
    savings: number;      // 0-25
    emergencyFund: number; // 0-30
    spending: number;     // 0-20
  };
  tips: string[];
}

export interface DepositDTO {
  _id: string;
  amount: number;
  note?: string;
  date: string;
}

export interface SavingsGoalDTO {
  _id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentBalance: number;
  monthlyDeposit: number;
  currency: string;
  isActive: boolean;
  isPrimary: boolean;
  color: string;
  deposits: DepositDTO[];
  progressPercent: number;
  monthsToGoal: number | null;
  createdAt: string;
}
