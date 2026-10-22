import { useState } from 'react';
import { useApp } from '../App';

export default function Transactions() {
  const { data, persist, money, getCat, getAcc } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    accountId: data.accounts[0]?.id || '',
    categoryId: '',
    subcategory: '',
    date: new Date().toISOString().slice(0, 10),
    note: ''
  });

  const cats = data.categories[form.type];

  const save = async () => {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return alert('Enter amount');
    const catId = form.categoryId || cats[0]?.id;
    const next = { ...data };
    next.transactions.unshift({
      id: 't' + Date.now(),
      type: form.type,
      amount,
      accountId: form.accountId,
      categoryId: catId,
      subcategory: form.subcategory,
      note: form.note,
      date: form.date,
      createdAt: new Date().toISOString()
    });
    const acc = next.accounts.find((a) => a.id === form.accountId);
    if (acc) acc.balance += form.type === 'income' ? amount : -amount;
    await persist(next);
    setShowAdd(false);
    setForm({ ...form, amount: '', note: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-16">
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Transactions</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>

      <div className="card">
        {data.transactions.map((t) => {
          const cat = getCat(t.categoryId);
          const acc = getAcc(t.accountId);
          return (
            <div key={t.id} className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--hairline)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{cat ? `${cat.icon} ${cat.name}` : '↔ Transfer'} {t.subcategory ? `→ ${t.subcategory}` : ''}</div>
                <div className="text-sm text-mute">{t.date} · {acc?.name}</div>
              </div>
              <div className={t.type === 'income' ? 'amount-in' : 'amount-out'}>
                {t.type === 'income' ? '+' : '−'}{money(t.amount)}
              </div>
            </div>
          );
        })}
        {!data.transactions.length && <div className="text-mute" style={{ padding: 24, textAlign: 'center' }}>No transactions yet</div>}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Transaction</h2>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any, categoryId: '' })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Account</label>
              <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
                {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.categoryId || cats[0]?.id} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Note</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
