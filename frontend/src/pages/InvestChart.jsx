import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getInvestmentHistory } from '../api/investments.js'
import PeriodFilter from '../components/PeriodFilter.jsx'
import HideableBalance, { formatCents } from '../components/HideableBalance.jsx'

export default function InvestChart() {
  const [period, setPeriod] = useState('month')
  const [history, setHistory] = useState([])

  useEffect(() => {
    getInvestmentHistory(period).then(setHistory).catch(() => setHistory([]))
  }, [period])

  const current = history.length > 0 ? history[history.length - 1].valueCents : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Grafico de investimento</h1>
        <Link to="/investir" className="btn-secondary">Voltar</Link>
      </div>

      <section className="card" style={{ marginTop: '1.25rem' }}>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dayKey" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => formatCents(v)} width={90} />
              <Tooltip
                formatter={(value) => formatCents(value)}
                contentStyle={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}
              />
              <Line type="monotone" dataKey="valueCents" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <PeriodFilter value={period} onChange={setPeriod} />
          <HideableBalance valueCents={current} />
        </div>
      </section>
    </div>
  )
}
