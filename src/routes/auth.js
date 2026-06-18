import { Router } from 'express'
import prisma from '../db.js'
import { hashPassword, comparePassword } from '../lib/password.js'
import { signToken } from '../lib/jwt.js'
import { generateUniquePersonalCode } from '../lib/personalCode.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
}

// Bonus de boas-vindas: o esboco nao mostra nenhuma tela de deposito externo
// (cartao, pix, etc.), entao sem isso toda conta nova ficaria travada em R$0,00 para sempre.
const SIGNUP_BONUS_CENTS = 100000

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    phone: user.phone,
    avatarPath: user.avatarPath,
    personalCode: user.personalCode,
    balanceCents: user.balanceCents,
  }
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {}

  if (
    typeof name !== 'string' || name.trim().length === 0 || name.length > 50 ||
    typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== 'string' || password.length < 6
  ) {
    return res.status(422).json({ error: 'Dados invalidos' })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return res.status(409).json({ error: 'Email ja cadastrado' })

  const passwordHash = await hashPassword(password)
  const personalCode = await generateUniquePersonalCode()

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      personalCode,
      balanceCents: SIGNUP_BONUS_CENTS,
      investment: { create: { type: 'FIXED' } },
      streak: { create: {} },
    },
  })

  const token = signToken(user.id)
  res.cookie('token', token, COOKIE_OPTIONS)
  res.status(201).json({ user: toPublicUser(user) })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(422).json({ error: 'Dados invalidos' })
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return res.status(401).json({ error: 'Credenciais invalidas' })

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Credenciais invalidas' })

  const token = signToken(user.id)
  res.cookie('token', token, COOKIE_OPTIONS)
  res.json({ user: toPublicUser(user) })
})

router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' })
  res.status(204).end()
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) return res.status(401).json({ error: 'Nao autenticado' })
  res.json({ user: toPublicUser(user) })
})

export default router
