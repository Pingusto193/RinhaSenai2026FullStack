import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  getAccount, updateAccount, uploadAvatar,
  changePassword, changeEmail, changePhone, regeneratePersonalCode,
} from '../api/account.js'
import { useAuth } from '../context/AuthContext.jsx'

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function Account() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [feedback, setFeedback] = useState(null)

  function load() {
    return getAccount()
      .then((acc) => {
        setAccount(acc)
        setName(acc.name)
        setBio(acc.bio ?? '')
        setPhone(acc.phone ?? '')
      })
      .catch((err) => showFeedback('error', err.message))
  }

  useEffect(() => {
    load()
  }, [])

  function showFeedback(type, message) {
    setFeedback({ type, message })
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    try {
      await updateAccount({ name, bio })
      showFeedback('success', 'Perfil atualizado!')
      load()
    } catch (err) {
      showFeedback('error', err.message)
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files[0]
    if (!file) return
    try {
      await uploadAvatar(file)
      showFeedback('success', 'Foto atualizada!')
      load()
    } catch (err) {
      showFeedback('error', err.message)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    try {
      await changePassword(currentPassword, newPassword)
      showFeedback('success', 'Senha alterada!')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      showFeedback('error', err.message)
    }
  }

  async function handleEmailSubmit(event) {
    event.preventDefault()
    try {
      await changeEmail(newEmail, currentPasswordForEmail)
      showFeedback('success', 'Email alterado!')
      setNewEmail('')
      setCurrentPasswordForEmail('')
      load()
    } catch (err) {
      showFeedback('error', err.message)
    }
  }

  async function handlePhoneSubmit(event) {
    event.preventDefault()
    try {
      await changePhone(phone)
      showFeedback('success', 'Telefone atualizado!')
    } catch (err) {
      showFeedback('error', err.message)
    }
  }

  async function handleRegenerateCode() {
    try {
      const result = await regeneratePersonalCode()
      showFeedback('success', `Novo codigo: ${result.personalCode}`)
      load()
    } catch (err) {
      showFeedback('error', err.message)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  if (!account) return <p>Carregando...</p>

  return (
    <div>
      <h1>Conta</h1>

      <div className="grid-2">
        <section className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            {account.avatarPath ? (
              <img src={account.avatarPath} alt={account.name} className="avatar" />
            ) : (
              <span className="avatar">{account.name[0]?.toUpperCase()}</span>
            )}
            <label className="btn-secondary" style={{ cursor: 'pointer' }}>
              Upload foto de perfil
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} hidden />
            </label>
          </div>

          <form className="form" onSubmit={handleProfileSubmit}>
            <Field label="Nome">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required />
            </Field>
            <Field label="Sobre">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={2} />
            </Field>
            <button type="submit" className="btn">Salvar perfil</button>
          </form>

        </section>

        <section className="card action-list">
          <p className="streak-badge">
            🔥 Atual: {account.streak.current} · Recorde: {account.streak.record}
          </p>

          <h2 style={{ marginTop: '0.5rem' }}>Codigo pessoal</h2>
          <p className="code-display">{account.personalCode}</p>
          <button type="button" className="btn-secondary" onClick={handleRegenerateCode}>
            Gerar novo codigo
          </button>

          <h2 style={{ marginTop: '1.25rem' }}>Trocar telefone</h2>
          <form className="form" onSubmit={handlePhoneSubmit}>
            <Field label="Numero">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
            </Field>
            <button type="submit" className="btn-secondary">Trocar numero de telefone</button>
          </form>

          <h2 style={{ marginTop: '1.25rem' }}>Trocar email</h2>
          <form className="form" onSubmit={handleEmailSubmit}>
            <Field label="Novo email">
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
            </Field>
            <Field label="Senha atual">
              <input
                type="password"
                value={currentPasswordForEmail}
                onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                required
              />
            </Field>
            <button type="submit" className="btn-secondary">Trocar email</button>
          </form>

          <h2 style={{ marginTop: '1.25rem' }}>Trocar senha</h2>
          <form className="form" onSubmit={handlePasswordSubmit}>
            <Field label="Senha atual">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Field>
            <Field label="Nova senha">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </Field>
            <button type="submit" className="btn-secondary">Trocar senha</button>
          </form>

          <button type="button" className="btn-danger" style={{ marginTop: '1.25rem' }} onClick={handleLogout}>
            Sair
          </button>
        </section>
      </div>

      {feedback?.type === 'success' && <p className="feedback-success">{feedback.message}</p>}
      {feedback?.type === 'error' && <p className="feedback-error">{feedback.message}</p>}
    </div>
  )
}
