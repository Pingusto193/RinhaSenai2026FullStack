import { Router } from 'express'
import prisma from '../db.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

async function loadFriendIds(userId) {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
  })
  return friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId))
}

// Junta 3 tabelas heterogeneas (transfers enviadas/recebidas + movimentos de investimento)
// em um unico extrato ordenado. Sem coluna compartilhada pra paginar via SQL, busca uma
// janela generosa de cada fonte, junta e pagina em memoria — suficiente para um app pessoal.
const LEDGER_WINDOW = 300

async function fetchLedgerWindow(userId) {
  const [sent, received, movements] = await Promise.all([
    prisma.transfer.findMany({
      where: { senderId: userId },
      include: { receiver: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: LEDGER_WINDOW,
    }),
    prisma.transfer.findMany({
      where: { receiverId: userId },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: LEDGER_WINDOW,
    }),
    prisma.investmentMovement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: LEDGER_WINDOW,
    }),
  ])

  const entries = [
    ...sent.map((t) => ({
      type: 'transfer_sent',
      amountCents: t.amountCents,
      counterparty: t.receiver.name,
      createdAt: t.createdAt,
    })),
    ...received.map((t) => ({
      type: 'transfer_received',
      amountCents: t.amountCents,
      counterparty: t.sender.name,
      createdAt: t.createdAt,
    })),
    ...movements.map((m) => ({
      type: m.type === 'DEPOSIT' ? 'investment_deposit' : 'investment_withdraw',
      amountCents: m.amountCents,
      counterparty: null,
      createdAt: m.createdAt,
    })),
  ]

  entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return entries
}

async function buildLedger(userId, limit) {
  const entries = await fetchLedgerWindow(userId)
  return entries.slice(0, limit)
}

async function buildLedgerPage(userId, page, limit) {
  const entries = await fetchLedgerWindow(userId)
  const start = (page - 1) * limit
  return {
    items: entries.slice(start, start + limit),
    total: entries.length,
  }
}

router.get('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  const streak = await prisma.streak.findUnique({ where: { userId: req.userId } })
  const friendIds = await loadFriendIds(req.userId)

  const friendStreaks = await prisma.streak.findMany({
    where: { userId: { in: [...friendIds, req.userId] } },
    include: { user: { select: { id: true, name: true } } },
  })

  const leaderboard = friendStreaks
    .map((s) => ({ userId: s.userId, name: s.user.name, current: s.current }))
    .sort((a, b) => b.current - a.current)
    .map((entry, index) => ({ rank: index + 1, ...entry }))

  const recentLedger = await buildLedger(req.userId, 5)

  res.json({
    balanceCents: user.balanceCents,
    ownStreak: { current: streak?.current ?? 0, record: streak?.record ?? 0 },
    recentLedger,
    friendsLeaderboard: leaderboard,
  })
})

router.get('/ledger', async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100)
  const { items, total } = await buildLedgerPage(req.userId, page, limit)
  res.json({ items, page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) })
})

export default router
