import { useApp } from '../App';

export default function Goals() {
  const { data, persist, money } = useApp();

  const addMoney = async (id: string) => {
    const raw = prompt('How much to add?');
    if (!raw || isNaN(Number(raw)) || Number(raw) <= 0) return;
    const next = {
      ...data,
      goals: data.goals.map((g) =>
        g.id === id ? { ...g, current: g.current + Number(raw) } : g
      )
    };
    await persist(next);
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Savings Goals</h1>
      {data.goals.map((g) => {
        const pct = Math.min(100, Math.round((g.current / g.target) * 100));
        return (
          <div key={g.id} className="card mb-12">
            <strong>{g.name}</strong>
            <div className="stat-value" style={{ margin: '6px 0' }}>{money(g.current)}</div>
            <div className="text-sm text-mute mb-8">of {money(g.target)} · Target {g.deadline || '—'}</div>
            <div className="progress" style={{ height: 10 }}>
              <div className="progress-bar" style={{ width: `${pct}%`, background: g.color }} />
            </div>
            <div className="text-sm" style={{ marginTop: 8 }}>{pct}% complete</div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => addMoney(g.id)}>
              + Add Money
            </button>
          </div>
        );
      })}
    </div>
  );
}
