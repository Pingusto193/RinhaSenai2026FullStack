import { verifyToken } from '../lib/jwt.js'

export default function requireAuth(req, res, next) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Nao autenticado' })

  try {
    req.userId = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Sessao invalida' })
  }
}
