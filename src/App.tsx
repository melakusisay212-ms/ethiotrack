import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import type { AppData, Transaction, Account, Budget, Goal, Loan, Category } from './types';
import { loadData, saveData, formatMoney } from './utils/storage';
import { toEthiopian, formatEthDate, ETH_MONTHS } from './utils/ethiopianCalendar';

import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import CalendarPage from './pages/CalendarPage';
import Insights from './pages/Insights';
import Settings from './pages/Settings';

type AppContextType = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  persist: (next: AppData) => Promise<void>;
  money: (n: number) => string;
  getCat: (id: string | null) => Category | undefined;
  getAcc: (id: string) => Account | undefined;
};

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside App');
  return ctx;
}

const NAV = [
  { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/transactions', label: 'Txns', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/accounts', label: 'Accounts', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { path: '/insights', label: 'Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
];

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: AppData) => {
    setData(next);
    await saveData(next);
  }, []);

  const money = useCallback(
    (n: number) => formatMoney(n, data?.settings.currency || 'ETB'),
    [data?.settings.currency]
  );

  const getCat = useCallback(
    (id: string | null) => {
      if (!id || !data) return undefined;
      return [...data.categories.expense, ...data.categories.income].find((c) => c.id === id);
    },
    [data]
  );

  const getAcc = useCallback(
    (id: string) => data?.accounts.find((a) => a.id === id),
    [data]
  );

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>EthioTrack</div>
          <div className="text-mute">Loading…</div>
        </div>
      </div>
    );
  }

  const eth = toEthiopian();
  const ctx: AppContextType = { data, setData, persist, money, getCat, getAcc };

  return (
    <AppContext.Provider value={ctx}>
      <div className="app-shell">
        <header className="topbar">
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {ETH_MONTHS[eth.month - 1]} {eth.day}, {eth.year}
            </div>
            <div className="text-sm text-mute">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div className="flex gap-8">
            {/* Quick actions can be added per page */}
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <nav className="bottom-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </AppContext.Provider>
  );
}
