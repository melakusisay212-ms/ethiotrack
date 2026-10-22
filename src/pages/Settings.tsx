import { useState } from 'react';
import { useApp } from '../App';
import type { Loan } from '../types';

export default function Settings() {
  const { data, persist, money } = useApp();
  const [showLoan, setShowLoan] = useState(false);
  const [loanForm, setLoanForm] = useState({
    person: '',
    type: 'owe' as 'owe' | 'owed',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    note: ''
  });

  const active = data.loans.filter((l) => l.status === 'active');
  const paid = data.loans.filter((l) => l.status === 'paid');
  const iOwe = active.filter((l) => l.type === 'owe').reduce((s, l) => s + l.remaining, 0);
  const theyOwe = active.filter((l) => l.type === 'owed').reduce((s, l) => s + l.remaining, 0);

  const saveLoan = async () => {
    if (!loanForm.person.trim() || !loanForm.amount) return alert('Name and amount required');
    const amount = Number(loanForm.amount);
    const next = { ...data };
    next.loans.unshift({
      id: 'l' + Date.now(),
      person: loanForm.person.trim(),
      type: loanForm.type,
      amount,
      remaining: amount,
      date: loanForm.date,
      note: loanForm.note,
      status: 'active'
    });
    await persist(next);
    setShowLoan(false);
    setLoanForm({ person: '', type: 'owe', amount: '', date: new Date().toISOString().slice(0, 10), note: '' });
  };

  const markPaid = async (id: string) => {
    const next = {
      ...data,
      loans: data.loans.map((l) =>
        l.id === id ? { ...l, status: 'paid' as const, remaining: 0 } : l
      )
    };
    await persist(next);
  };

  const partialPay = async (id: string) => {
    const loan = data.loans.find((l) => l.id === id);
    if (!loan) return;
    const raw = prompt(`How much paid? (Remaining ${money(loan.remaining)})`);
    if (!raw || isNaN(Number(raw))) return;
    const pay = Math.min(Number(raw), loan.remaining);
    const next = {
      ...data,
      loans: data.loans.map((l) => {
        if (l.id !== id) return l;
        const remaining = l.remaining - pay;
        return {
          ...l,
          remaining: Math.max(0, remaining),
          status: remaining <= 0 ? ('paid' as const) : l.status
        };
      })
    };
    await persist(next);
  };

  const deleteLoan = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    await persist({ ...data, loans: data.loans.filter((l) => l.id !== id) });
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Settings</h1>

      <div className="card mb-16">
        <strong className="mb-12" style={{ display: 'block' }}>Currency</strong>
        <select
          value={data.settings.currency}
          onChange={async (e) => {
            await persist({ ...data, settings: { ...data.settings, currency: e.target.value } });
          }}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--hairline)' }}
        >
          <option value="ETB">ETB — Ethiopian Birr</option>
          <option value="USD">USD</option>
        </select>
      </div>

      {/* LOANS & DEBTS — only here */}
      <div className="card mb-16">
        <div className="flex justify-between items-center mb-12">
          <strong>Loans & Debts</strong>
          <button className="btn btn-primary btn-sm" onClick={() => setShowLoan(true)}>+ Add</button>
        </div>
        <p className="text-sm text-mute mb-16">
          Private tracker. Not shown on Home or Transactions. Track who you borrowed from and who borrowed from you.
        </p>

        <div className="grid-2 mb-16">
          <div className="card" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
            <div className="text-sm text-mute">I owe others</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>{money(iOwe)}</div>
          </div>
          <div className="card" style={{ background: '#f0fdfa', borderColor: '#99f6e4' }}>
            <div className="text-sm text-mute">Others owe me</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{money(theyOwe)}</div>
          </div>
        </div>

        <h4 className="mb-12">Active</h4>
        {active.length === 0 && <p className="text-mute text-sm mb-12">No active loans/debts</p>}
        {active.map((l) => (
          <div
            key={l.id}
            className="card mb-12"
            style={{ borderLeft: `4px solid ${l.type === 'owe' ? 'var(--danger)' : 'var(--success)'}` }}
          >
            <div className="flex justify-between items-center">
              <div>
                <strong>{l.person}</strong>
                <span className={`tag ${l.type === 'owe' ? 'tag-owe' : 'tag-owed'}`} style={{ marginLeft: 8 }}>
                  {l.type === 'owe' ? 'I owe' : 'They owe me'}
                </span>
              </div>
              <div style={{ fontWeight: 600 }}>{money(l.remaining)}</div>
            </div>
            <div className="text-sm text-mute" style={{ marginTop: 4 }}>
              {l.date} {l.note ? `· ${l.note}` : ''}
            </div>
            <div className="flex gap-8" style={{ marginTop: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => partialPay(l.id)}>Partial Pay</button>
              <button className="btn btn-success btn-sm" onClick={() => markPaid(l.id)}>Mark Paid</button>
              <button className="btn btn-ghost btn-sm" onClick={() => deleteLoan(l.id)}>Delete</button>
            </div>
          </div>
        ))}

        {paid.length > 0 && (
          <>
            <h4 className="mb-12" style={{ marginTop: 20 }}>Paid / Settled</h4>
            {paid.map((l) => (
              <div key={l.id} className="card mb-8" style={{ opacity: 0.7 }}>
                <div className="flex justify-between">
                  <span><strong>{l.person}</strong> <span className="tag tag-paid">Paid</span></span>
                  <span>{money(l.amount)}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="card">
        <strong className="mb-12" style={{ display: 'block' }}>About</strong>
        <p className="text-sm text-mute">
          EthioTrack — Ethiopian calendar expense tracker.<br />
          Built with React + Capacitor for Android.
        </p>
      </div>

      {showLoan && (
        <div className="modal-overlay" onClick={() => setShowLoan(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Loan / Debt</h2>
            <div className="form-group">
              <label>Person Name</label>
              <input
                value={loanForm.person}
                onChange={(e) => setLoanForm({ ...loanForm, person: e.target.value })}
                placeholder="e.g. Abebe Kebede"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={loanForm.type}
                onChange={(e) => setLoanForm({ ...loanForm, type: e.target.value as any })}
              >
                <option value="owe">I borrowed from them (I owe)</option>
                <option value="owed">They borrowed from me (They owe me)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={loanForm.amount}
                onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={loanForm.date}
                onChange={(e) => setLoanForm({ ...loanForm, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Note</label>
              <input
                value={loanForm.note}
                onChange={(e) => setLoanForm({ ...loanForm, note: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowLoan(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveLoan}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
