import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useApp } from '../App';

Chart.register(...registerables);

export default function Insights() {
  const { data, money, getCat } = useApp();
  const catRef = useRef<HTMLCanvasElement>(null);
  const trendRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const expByCat: Record<string, number> = {};
    data.transactions.filter((t) => t.type === 'expense').forEach((t) => {
      const c = getCat(t.categoryId);
      if (c) expByCat[c.name] = (expByCat[c.name] || 0) + t.amount;
    });
    const labels = Object.keys(expByCat);
    const values = Object.values(expByCat);

    let catChart: Chart | null = null;
    if (catRef.current) {
      catChart = new Chart(catRef.current, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: ['#533afd', '#0d9488', '#d97706', '#ea2261', '#6366f1', '#8b5cf6', '#ec4899'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }
      });
    }

    const months: Record<string, { income: number; expense: number }> = {};
    data.transactions.forEach((t) => {
      const m = t.date.slice(0, 7);
      if (!months[m]) months[m] = { income: 0, expense: 0 };
      if (t.type === 'income' || t.type === 'expense') months[m][t.type] += t.amount;
    });
    const sorted = Object.keys(months).sort().slice(-6);

    let trendChart: Chart | null = null;
    if (trendRef.current) {
      trendChart = new Chart(trendRef.current, {
        type: 'bar',
        data: {
          labels: sorted,
          datasets: [
            { label: 'Income', data: sorted.map((m) => months[m].income), backgroundColor: '#0d9488' },
            { label: 'Expense', data: sorted.map((m) => months[m].expense), backgroundColor: '#ea2261' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
      });
    }

    return () => {
      catChart?.destroy();
      trendChart?.destroy();
    };
  }, [data, getCat]);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Insights</h1>
      <div className="card mb-16">
        <strong className="mb-12" style={{ display: 'block' }}>Spending by Category</strong>
        <div style={{ height: 240 }}><canvas ref={catRef} /></div>
      </div>
      <div className="card">
        <strong className="mb-12" style={{ display: 'block' }}>Income vs Expense</strong>
        <div style={{ height: 240 }}><canvas ref={trendRef} /></div>
      </div>
    </div>
  );
}
