import { Router } from 'express'
import prisma from '../db.js'
import requireAuth from '../middleware/requireAuth.js'
import { applyAccrual } from '../lib/accrual.js'
import { applyStreak } from '../lib/streak.js'

const router = Router()
router.use(requireAuth)

const PERIOD_DAYS = { day: 1, week: 7, month: 30, year: 365 }

async function loadCurrentInvestment(userId) {
  const investment = await prisma.investment.findUnique({ where: { userId } })
  const accrued = await applyAccrual(investment)
  await applyStreak(userId, accrued.principalCents)
  return accrued
}

router.get('/', async (req, res) => {
  const investment = await loadCurrentInvestment(req.userId)
  res.json({
    type: investment.type,
    principalCents: investment.principalCents,
    lastAccrualAt: investment.lastAccrualAt,
  })
})

router.post('/type', async (req, res) => {
  const { type } = req.body ?? {}
  if (type !== 'FIXED' && type !== 'VARIABLE') {
    return res.status(422).json({ error: 'Tipo invalido' })
  }

  await loadCurrentInvestment(req.userId)
  const investment = await prisma.investment.update({
    where: { userId: req.userId },
    data: { type },
  })
  res.json({ type: investment.type })
})

router.post('/deposit', async (req, res) => {
  const { amountCents } = req.body ?? {}
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return res.status(422).json({ error: 'Valor invalido' })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: req.userId } })
      if (user.balanceCents < amountCents) {
        const error = new Error('Saldo insuficiente')
        error.statusCode = 400
        throw error
      }

      await tx.user.update({
        where: { id: req.userId },
        data: { balanceCents: user.balanceCents - amountCents },
      })

      const investment = await tx.investment.update({
        where: { userId: req.userId },
        data: { principalCents: { increment: amountCents } },
      })

      await tx.investmentMovement.create({
        data: { userId: req.userId, type: 'DEPOSIT', amountCents },
      })

      return investment
    })

    await applyStreak(req.userId, result.principalCents)
    res.json({ principalCents: result.principalCents })
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message })
  }
})

router.post('/withdraw', async (req, res) => {
  const { amountCents } = req.body ?? {}
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return res.status(422).json({ error: 'Valor invalido' })
  }

  await loadCurrentInvestment(req.userId)

  try {
    const result = await prisma.$transaction(async (tx) => {
      const investment = await tx.investment.findUnique({ where: { userId: req.userId } })
      if (investment.principalCents < amountCents) {
        const error = new Error('Valor investido insuficiente')
        error.statusCode = 400
        throw error
      }

      const updatedInvestment = await tx.investment.update({
        where: { userId: req.userId },
        data: { principalCents: { decrement: amountCents } },
      })

      const user = await tx.user.update({
        where: { id: req.userId },
        data: { balanceCents: { increment: amountCents } },
      })

      await tx.investmentMovement.create({
        data: { userId: req.userId, type: 'WITHDRAW', amountCents },
      })

      return { investment: updatedInvestment, user }
    })

    await applyStreak(req.userId, result.investment.principalCents)
    res.json({ principalCents: result.investment.principalCents, balanceCents: result.user.balanceCents })
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message })
  }
})

router.get('/history', async (req, res) => {
  await loadCurrentInvestment(req.userId)

  const period = req.query.period ?? 'month'
  const days = PERIOD_DAYS[period] ?? PERIOD_DAYS.month
  const since = new Date()
  since.setDate(since.getDate() - days)

  const snapshots = await prisma.investmentSnapshot.findMany({
    where: { userId: req.userId, capturedAt: { gte: since } },
    orderBy: { capturedAt: 'asc' },
  })

  res.json(snapshots.map((s) => ({ dayKey: s.dayKey, valueCents: s.valueCents })))
})

export default router
