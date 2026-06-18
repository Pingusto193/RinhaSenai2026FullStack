import { Router } from 'express'
import prisma from '../db.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: req.userId }, { userBId: req.userId }] },
  })

  const friendIds = friendships.map((f) => (f.userAId === req.userId ? f.userBId : f.userAId))

  const friends = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    include: { streak: true },
  })

  res.json(friends.map((f) => ({
    id: f.id,
    name: f.name,
    avatarPath: f.avatarPath,
    streak: { current: f.streak?.current ?? 0 },
  })))
})

router.post('/', async (req, res) => {
  const { personalCode } = req.body ?? {}
  if (typeof personalCode !== 'string' || personalCode.trim().length === 0) {
    return res.status(422).json({ error: 'Codigo invalido' })
  }

  const friend = await prisma.user.findUnique({
    where: { personalCode: personalCode.trim().toUpperCase() },
  })
  if (!friend) return res.status(404).json({ error: 'Codigo pessoal nao encontrado' })
  if (friend.id === req.userId) return res.status(400).json({ error: 'Voce nao pode se adicionar' })

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: req.userId, userBId: friend.id },
        { userAId: friend.id, userBId: req.userId },
      ],
    },
  })
  if (existing) return res.status(409).json({ error: 'Ja sao amigos' })

  await prisma.friendship.create({ data: { userAId: req.userId, userBId: friend.id } })
  res.status(201).json({ friend: { id: friend.id, name: friend.name, avatarPath: friend.avatarPath } })
})

export default router
