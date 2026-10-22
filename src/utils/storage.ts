import { Preferences } from '@capacitor/preferences';
import type { AppData } from '../types';

const STORAGE_KEY = 'ethiotrack_v3';

const DEFAULT_DATA: AppData = {
  accounts: [
    { id: 'a1', name: 'Commercial Bank', type: 'Bank', balance: 48500, color: '#533afd' },
    { id: 'a2', name: 'Cash Wallet', type: 'Cash', balance: 3200, color: '#0d9488' },
    { id: 'a3', name: 'Telebirr', type: 'Mobile', balance: 8750, color: '#d97706' }
  ],
  categories: {
    expense: [
      { id: 'e1', name: 'Food & Dining', icon: '🍽️', subs: ['Groceries', 'Restaurants', 'Coffee', 'Delivery'] },
      { id: 'e2', name: 'Transport', icon: '🚗', subs: ['Taxi', 'Fuel', 'Public Transport', 'Ride Share'] },
      { id: 'e3', name: 'Housing', icon: '🏠', subs: ['Rent', 'Utilities', 'Internet', 'Maintenance'] },
      { id: 'e4', name: 'Shopping', icon: '🛍️', subs: ['Clothes', 'Electronics', 'Personal Care'] },
      { id: 'e5', name: 'Health', icon: '💊', subs: ['Medicine', 'Clinic', 'Insurance'] },
      { id: 'e6', name: 'Education', icon: '📚', subs: ['School Fees', 'Books', 'Courses'] },
      { id: 'e7', name: 'Entertainment', icon: '🎬', subs: ['Movies', 'Streaming', 'Events'] }
    ],
    income: [
      { id: 'i1', name: 'Salary', icon: '💰', subs: ['Primary Job', 'Bonus'] },
      { id: 'i2', name: 'Freelance', icon: '💻', subs: ['Projects', 'Consulting'] },
      { id: 'i3', name: 'Business', icon: '🏪', subs: ['Sales', 'Services'] },
      { id: 'i4', name: 'Other Income', icon: '🎁', subs: ['Gifts', 'Refunds', 'Interest'] }
    ]
  },
  transactions: [],
  budgets: [
    { id: 'b1', categoryId: 'e1', amount: 8000 },
    { id: 'b2', categoryId: 'e2', amount: 3500 },
    { id: 'b3', categoryId: 'e3', amount: 12000 }
  ],
  goals: [
    { id: 'g1', name: 'Emergency Fund', target: 50000, current: 18500, deadline: '2019-06-30', color: '#533afd' },
    { id: 'g2', name: 'New Laptop', target: 45000, current: 22000, deadline: '2019-04-15', color: '#0d9488' },
    { id: 'g3', name: 'Family Trip', target: 30000, current: 9500, deadline: '2019-08-01', color: '#d97706' }
  ],
  loans: [
    { id: 'l1', person: 'Abebe Kebede', type: 'owed', amount: 5000, remaining: 5000, date: '2026-09-15', note: 'For school fees', status: 'active' },
    { id: 'l2', person: 'Sara Tadesse', type: 'owe', amount: 2500, remaining: 2500, date: '2026-10-01', note: 'Emergency help', status: 'active' }
  ],
  settings: { currency: 'ETB' }
};

function generateSampleTransactions(): AppData['transactions'] {
  const txs: AppData['transactions'] = [];
  const now = new Date();
  for (let i = 0; i < 40; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 40));
    const isIncome = Math.random() > 0.7;
    const cats = isIncome ? DEFAULT_DATA.categories.income : DEFAULT_DATA.categories.expense;
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const sub = cat.subs[Math.floor(Math.random() * cat.subs.length)];
    const amount = isIncome
      ? Math.floor(Math.random() * 15000) + 4000
      : Math.floor(Math.random() * 2500) + 80;
    txs.push({
      id: `t${i}_${Date.now()}`,
      type: isIncome ? 'income' : 'expense',
      amount,
      accountId: DEFAULT_DATA.accounts[Math.floor(Math.random() * 3)].id,
      categoryId: cat.id,
      subcategory: sub,
      note: '',
      date: d.toISOString().slice(0, 10),
      createdAt: d.toISOString()
    });
  }
  return txs.sort((a, b) => b.date.localeCompare(a.date));
}

export async function loadData(): Promise<AppData> {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (value) {
      const parsed = JSON.parse(value) as AppData;
      if (!parsed.loans) parsed.loans = DEFAULT_DATA.loans;
      return parsed;
    }
  } catch {
    // fallback
  }
  // first run
  const data = structuredClone(DEFAULT_DATA);
  data.transactions = generateSampleTransactions();
  await saveData(data);
  return data;
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(data)
    });
  } catch {
    // web fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function formatMoney(amount: number, currency = 'ETB'): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount || 0);
}
