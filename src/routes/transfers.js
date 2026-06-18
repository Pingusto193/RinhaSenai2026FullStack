import { Router } from 'express'
import prisma from '../db.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

router.get('/sent', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50)

  const transfers = await prisma.transfer.findMany({
    where: { senderId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { receiver: { select: { name: true } } },
  })

  res.json(transfers.map((t) => ({
    id: t.id,
    receiverName: t.receiver.name,
    receiverCodeSnapshot: t.receiverCodeSnapshot,
    amountCents: t.amountCents,
    createdAt: t.createdAt,
  })))
})

router.post('/', async (req, res) => {
  const { receiverPersonalCode, amountCents } = req.body ?? {}

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return res.status(422).json({ error: 'Valor invalido' })
  }
  if (typeof receiverPersonalCode !== 'string' || receiverPersonalCode.trim().length === 0) {
    return res.status(422).json({ error: 'Codigo invalido' })
  }

  try {
    const transfer = await prisma.$transaction(async (tx) => {
      const receiver = await tx.user.findUnique({
        where: { personalCode: receiverPersonalCode.trim().toUpperCase() },
      })
      if (!receiver) {
        const error = new Error('Codigo pessoal nao encontrado')
        error.statusCode = 404
        throw error
      }
      if (receiver.id === req.userId) {
        const error = new Error('Nao e possivel transferir para si mesmo')
        error.statusCode = 400
        throw error
      }

      const sender = await tx.user.findUnique({ where: { id: req.userId } })
      if (sender.balanceCents < amountCents) {
        const error = new Error('Saldo insuficiente')
        error.statusCode = 400
        throw error
      }

      await tx.user.update({
        where: { id: sender.id },
        data: { balanceCents: { decrement: amountCents } },
      })
      await tx.user.update({
        where: { id: receiver.id },
        data: { balanceCents: { increment: amountCents } },
      })

      return tx.transfer.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          amountCents,
          receiverCodeSnapshot: receiver.personalCode,
        },
        include: { receiver: { select: { name: true } } },
      })
    })

    res.status(201).json({
      id: transfer.id,
      receiverName: transfer.receiver.name,
      amountCents: transfer.amountCents,
      createdAt: transfer.createdAt,
    })
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message })
  }
})

export default router
