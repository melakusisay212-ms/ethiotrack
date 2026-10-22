export type Account = {
  id: string;
  name: string;
  type: 'Bank' | 'Cash' | 'Mobile' | 'Other';
  balance: number;
  color: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  subs: string[];
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  accountId: string;
  toAccountId?: string;
  categoryId: string | null;
  subcategory: string;
  note: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
};

export type Loan = {
  id: string;
  person: string;
  type: 'owe' | 'owed'; // owe = I borrowed, owed = they borrowed from me
  amount: number;
  remaining: number;
  date: string;
  note: string;
  status: 'active' | 'paid';
};

export type AppData = {
  accounts: Account[];
  categories: {
    expense: Category[];
    income: Category[];
  };
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  loans: Loan[];
  settings: {
    currency: string;
  };
};

export type EthDate = {
  year: number;
  month: number;
  day: number;
};
