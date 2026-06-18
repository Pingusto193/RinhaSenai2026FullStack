export function dayKeyOf(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthKeyOf(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function parseDayKey(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function daysBetween(a, b) {
  const ms = parseDayKey(dayKeyOf(b)) - parseDayKey(dayKeyOf(a))
  return Math.round(ms / 86400000)
}

function startOfWeek(date) {
  const d = new Date(date)
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function bucketKeyOf(date, period) {
  if (period === 'day') return dayKeyOf(date)
  if (period === 'week') return dayKeyOf(startOfWeek(date))
  if (period === 'year') return String(date.getFullYear())
  return monthKeyOf(date)
}
