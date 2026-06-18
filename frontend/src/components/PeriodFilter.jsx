const PERIODS = [
  { key: 'day', label: 'Dia' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'year', label: 'Ano' },
]

export default function PeriodFilter({ value, onChange }) {
  return (
    <div className="period-filter">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          type="button"
          className={`period-btn${value === p.key ? ' active' : ''}`}
          onClick={() => onChange(p.key)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
