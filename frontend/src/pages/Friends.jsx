import { useState, useEffect } from 'react'
import { getFriends, addFriend } from '../api/friends.js'
import BrandMark from '../components/BrandMark.jsx'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function load() {
    getFriends()
      .then(setFriends)
      .catch((err) => setFeedback({ type: 'error', message: err.message }))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const result = await addFriend(code.trim().toUpperCase())
      setFeedback({ type: 'success', message: `${result.friend.name} adicionado!` })
      setCode('')
      load()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1>Amigos</h1>

      <div className="grid-2">
        <section className="card">
          <h2>Adicionar amigo</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Codigo pessoal do amigo</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={8} required />
            </label>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
          {feedback?.type === 'success' && <p className="feedback-success">{feedback.message}</p>}
          {feedback?.type === 'error' && <p className="feedback-error">{feedback.message}</p>}
        </section>

        <section className="card">
          <h2>Seus amigos · {friends.length}</h2>
          {friends.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum amigo ainda.</p>
          ) : (
            <div className="list">
              {friends.map((f) => (
                <div className="list-item" key={f.id}>
                  <span>{f.name}</span>
                  <span className="streak-badge"><BrandMark size={16} /> {f.streak.current}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
