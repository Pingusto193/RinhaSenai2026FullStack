import { useState } from 'react'
import EyeIcon from './EyeIcon.jsx'

export function formatCents(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function HideableBalance({ valueCents, className = 'balance-value' }) {
  const [hidden, setHidden] = useState(false)

  return (
    <span className="balance-block">
      <span className={className}>{hidden ? '••••••' : formatCents(valueCents)}</span>
      <button
        type="button"
        className="btn-icon"
        onClick={() => setHidden((h) => !h)}
        aria-label={hidden ? 'Mostrar valor' : 'Ocultar valor'}
        title={hidden ? 'Mostrar valor' : 'Ocultar valor'}
      >
        <EyeIcon hidden={hidden} />
      </button>
    </span>
  )
}
