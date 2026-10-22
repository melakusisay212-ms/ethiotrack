import { useApp } from '../App';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data, money, getCat, getAcc } = useApp();
  const total = data.accounts.reduce((s, a) => s + a.balance, 0);
  const mk = new Date().toISOString().slice(0, 7);
  const income = data.transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(mk))
    .reduce((s, t) => s + t.amount, 0);
  const expense = data.transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(mk))
    .reduce((s, t) => s + t.amount, 0);
  const recent = data.transactions.slice(0, 6);

  const spentOn = (catId: string) =>
    data.transactions
      .filter((t) => t.type === 'expense' && t.categoryId === catId && t.date.startsWith(mk))
      .reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Dashboard</h1>

      <div className="grid-2 mb-16">
        <div className="card">
          <div className="text-sm text-mute">Total Balance</div>
          <div className="stat-value">{money(total)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-mute">Net this month</div>
          <div className="stat-value" style={{ color: income - expense >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {money(income - expense)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-mute">Income</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{money(income)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-mute">Expenses</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{money(expense)}</div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="flex justify-between items-center mb-12">
          <strong>Recent Transactions</strong>
          <Link to="/transactions" className="btn btn-ghost btn-sm">See all</Link>
        </div>
        {recent.map((t) => {
          const cat = getCat(t.categoryId);
          const acc = getAcc(t.accountId);
          return (
            <div key={t.id} className="flex justify-between items-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--hairline)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{cat ? `${cat.icon} ${cat.name}` : 'Transfer'}</div>
                <div className="text-sm text-mute">{t.date} · {acc?.name}</div>
              </div>
              <div className={t.type === 'income' ? 'amount-in' : 'amount-out'}>
                {t.type === 'income' ? '+' : '−'}{money(t.amount)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <strong className="mb-12" style={{ display: 'block' }}>Budget Health</strong>
        {data.budgets.map((b) => {
          const spent = spentOn(b.categoryId);
          const pct = Math.min(100, Math.round((spent / b.amount) * 100));
          const cat = getCat(b.categoryId);
          const col = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--primary)';
          return (
            <div key={b.id} className="mb-16">
              <div className="flex justify-between text-sm mb-8">
                <span>{cat?.icon} {cat?.name}</span>
                <span>{money(spent)} / {money(b.amount)}</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${pct}%`, background: col }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
