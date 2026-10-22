import { useState } from 'react';
import { useApp } from '../App';
import {
  toEthiopian,
  ETH_MONTHS,
  ETH_MONTHS_AM,
  WEEKDAYS,
  daysInEthMonth,
  ethToGregorian
} from '../utils/ethiopianCalendar';

export default function CalendarPage() {
  const { data, money, getCat } = useApp();
  const [eth, setEth] = useState(toEthiopian());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const changeMonth = (delta: number) => {
    let { year, month } = eth;
    month += delta;
    if (month > 13) { month = 1; year++; }
    if (month < 1) { month = 13; year--; }
    setEth({ year, month, day: 1 });
    setSelectedDay(null);
  };

  const dim = daysInEthMonth(eth.year, eth.month);
  const firstG = ethToGregorian(eth.year, eth.month, 1);
  const startWd = firstG.getDay();

  const dayTxs = selectedDay
    ? data.transactions.filter((t) => {
        const te = toEthiopian(new Date(t.date + 'T12:00:00'));
        return te.year === eth.year && te.month === eth.month && te.day === selectedDay;
      })
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-16">
        <button className="btn btn-ghost" onClick={() => changeMonth(-1)}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>
          {ETH_MONTHS[eth.month - 1]} {eth.year}
          <span className="text-sm text-mute" style={{ fontWeight: 400, marginLeft: 6 }}>
            ({ETH_MONTHS_AM[eth.month - 1]})
          </span>
        </h1>
        <button className="btn btn-ghost" onClick={() => changeMonth(1)}>→</button>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-mute)', padding: 6 }}>{w}</div>
          ))}
          {Array.from({ length: startWd }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: dim }, (_, i) => i + 1).map((d) => {
            const isToday =
              d === toEthiopian().day &&
              eth.month === toEthiopian().month &&
              eth.year === toEthiopian().year;
            const hasTx = data.transactions.some((t) => {
              const te = toEthiopian(new Date(t.date + 'T12:00:00'));
              return te.year === eth.year && te.month === eth.month && te.day === d;
            });
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                style={{
                  aspectRatio: '1',
                  border: 'none',
                  borderRadius: 8,
                  background: isToday ? 'var(--primary-soft)' : selectedDay === d ? '#e0e7ff' : 'transparent',
                  color: isToday ? 'var(--primary)' : 'inherit',
                  fontWeight: isToday || selectedDay === d ? 600 : 400,
                  position: 'relative',
                  fontSize: 13
                }}
              >
                {d}
                {hasTx && (
                  <span style={{
                    position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {selectedDay && (
          <div style={{ marginTop: 16 }}>
            <strong>{ETH_MONTHS[eth.month - 1]} {selectedDay}</strong>
            {dayTxs.length === 0 ? (
              <p className="text-mute text-sm" style={{ marginTop: 8 }}>No transactions</p>
            ) : (
              dayTxs.map((t) => {
                const cat = getCat(t.categoryId);
                return (
                  <div key={t.id} className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--hairline)' }}>
                    <span>{cat ? `${cat.icon} ${cat.name}` : 'Transfer'}</span>
                    <span className={t.type === 'income' ? 'amount-in' : 'amount-out'}>
                      {t.type === 'income' ? '+' : '−'}{money(t.amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
