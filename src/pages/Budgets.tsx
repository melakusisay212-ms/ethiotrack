import { useApp } from '../App';

export default function Budgets() {
  const { data, money, getCat } = useApp();
  const mk = new Date().toISOString().slice(0, 7);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Budgets</h1>
      {data.budgets.map((b) => {
        const spent = data.transactions
          .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(mk))
          .reduce((s, t) => s + t.amount, 0);
        const pct = Math.min(100, Math.round((spent / b.amount) * 100));
        const cat = getCat(b.categoryId);
        const rem = b.amount - spent;
        const col = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--primary)';
        return (
          <div key={b.id} className="card mb-12">
            <div className="flex justify-between items-center mb-8">
              <strong>{cat?.icon} {cat?.name}</strong>
              <span className="tag">{pct}%</span>
            </div>
            <div className="progress" style={{ height: 10, marginBottom: 8 }}>
              <div className="progress-bar" style={{ width: `${pct}%`, background: col }} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Spent: <strong>{money(spent)}</strong></span>
              <span>Left: <strong style={{ color: rem >= 0 ? 'var(--success)' : 'var(--danger)' }}>{money(rem)}</strong></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
