import { useState } from 'react';
import { useApp } from '../App';

export default function Accounts() {
  const { data, persist, money } = useApp();
  const [showTransfer, setShowTransfer] = useState(false);
  const [fromId, setFromId] = useState(data.accounts[0]?.id || '');
  const [toId, setToId] = useState(data.accounts[1]?.id || '');
  const [amount, setAmount] = useState('');

  const doTransfer = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return alert('Enter amount');
    if (fromId === toId) return alert('Choose different accounts');
    const next = { ...data, accounts: data.accounts.map((a) => ({ ...a })) };
    const from = next.accounts.find((a) => a.id === fromId)!;
    const to = next.accounts.find((a) => a.id === toId)!;
    if (from.balance < amt) return alert('Insufficient balance');
    from.balance -= amt;
    to.balance += amt;
    next.transactions.unshift({
      id: 'tr' + Date.now(),
      type: 'transfer',
      amount: amt,
      accountId: fromId,
      toAccountId: toId,
      categoryId: null,
      subcategory: 'Transfer',
      note: `To ${to.name}`,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString()
    });
    await persist(next);
    setShowTransfer(false);
    setAmount('');
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Accounts</h1>
      <div className="grid-3 mb-16">
        {data.accounts.map((a) => (
          <div key={a.id} className="card" style={{ borderLeft: `4px solid ${a.color}` }}>
            <div className="text-sm text-mute">{a.type}</div>
            <div style={{ fontWeight: 600, margin: '4px 0' }}>{a.name}</div>
            <div className="stat-value">{money(a.balance)}</div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => setShowTransfer(true)}>Transfer between accounts</button>

      {showTransfer && (
        <div className="modal-overlay" onClick={() => setShowTransfer(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Transfer</h2>
            <div className="form-group">
              <label>From</label>
              <select value={fromId} onChange={(e) => setFromId(e.target.value)}>
                {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({money(a.balance)})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>To</label>
              <select value={toId} onChange={(e) => setToId(e.target.value)}>
                {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowTransfer(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={doTransfer}>Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
