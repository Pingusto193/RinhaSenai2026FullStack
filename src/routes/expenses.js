import { Router } from 'express'
import prisma from '../db.js'
import requireAuth from '../middleware/requireAuth.js'
import { bucketKeyOf } from '../lib/dateKey.js'

const router = Router()
router.use(requireAuth)

const PERIOD_DAYS = { day: 1, week: 7, month: 30, year: 365 }

router.get('/recent', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50)

  const transfers = await prisma.transfer.findMany({
    where: { senderId: req.userId },
    include: { receiver: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  res.json(transfers.map((t) => ({
    id: t.id,
    receiverName: t.receiver.name,
    amountCents: t.amountCents,
    createdAt: t.createdAt,
  })))
})

router.get('/aggregate', async (req, res) => {
  const period = req.query.period ?? 'month'
  const days = PERIOD_DAYS[period] ?? PERIOD_DAYS.month
  const since = new Date()
  since.setDate(since.getDate() - days)

  const transfers = await prisma.transfer.findMany({
    where: { senderId: req.userId, createdAt: { gte: since } },
  })

  const buckets = new Map()
  for (const t of transfers) {
    const key = bucketKeyOf(new Date(t.createdAt), period)
    buckets.set(key, (buckets.get(key) ?? 0) + t.amountCents)
  }

  const aggregate = [...buckets.entries()]
    .map(([bucketKey, totalCents]) => ({ bucketKey, totalCents }))
    .sort((a, b) => (a.bucketKey < b.bucketKey ? -1 : 1))

  res.json(aggregate)
})

export default router
