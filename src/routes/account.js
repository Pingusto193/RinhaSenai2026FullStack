import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import crypto from 'node:crypto'
import prisma from '../db.js'
import requireAuth from '../middleware/requireAuth.js'
import { hashPassword, comparePassword } from '../lib/password.js'
import { generateUniquePersonalCode } from '../lib/personalCode.js'

const router = Router()
router.use(requireAuth)

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/avatars',
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${req.userId}-${crypto.randomUUID()}${ext}`)
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Formato de imagem invalido'))
    }
    cb(null, true)
  },
})

router.get('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  const streak = await prisma.streak.findUnique({ where: { userId: req.userId } })

  res.json({
    name: user.name,
    email: user.email,
    bio: user.bio,
    phone: user.phone,
    avatarPath: user.avatarPath,
    personalCode: user.personalCode,
    streak: { current: streak?.current ?? 0, record: streak?.record ?? 0 },
  })
})

router.patch('/', async (req, res) => {
  const { name, bio } = req.body ?? {}
  const data = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 50) {
      return res.status(422).json({ error: 'Nome invalido' })
    }
    data.name = name.trim()
  }
  if (bio !== undefined) {
    if (typeof bio !== 'string' || bio.length > 160) {
      return res.status(422).json({ error: 'Bio invalida' })
    }
    data.bio = bio.trim()
  }

  const user = await prisma.user.update({ where: { id: req.userId }, data })
  res.json({ name: user.name, bio: user.bio })
})

router.post('/avatar', (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) return res.status(422).json({ error: err.message })
    if (!req.file) return res.status(422).json({ error: 'Arquivo nao enviado' })

    const avatarPath = `/uploads/avatars/${req.file.filename}`
    await prisma.user.update({ where: { id: req.userId }, data: { avatarPath } })
    res.json({ avatarPath })
  })
})

router.post('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {}
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(422).json({ error: 'Nova senha invalida' })
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  const valid = await comparePassword(currentPassword ?? '', user.passwordHash)
  if (!valid) return res.status(400).json({ error: 'Senha atual incorreta' })

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } })
  res.status(204).end()
})

router.post('/email', async (req, res) => {
  const { newEmail, currentPassword } = req.body ?? {}
  if (typeof newEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return res.status(422).json({ error: 'Email invalido' })
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  const valid = await comparePassword(currentPassword ?? '', user.passwordHash)
  if (!valid) return res.status(400).json({ error: 'Senha atual incorreta' })

  const existing = await prisma.user.findUnique({ where: { email: newEmail.toLowerCase() } })
  if (existing && existing.id !== req.userId) {
    return res.status(409).json({ error: 'Email ja em uso' })
  }

  const updated = await prisma.user.update({
    where: { id: req.userId },
    data: { email: newEmail.toLowerCase() },
  })
  res.json({ email: updated.email })
})

router.post('/phone', async (req, res) => {
  const { phone } = req.body ?? {}
  if (typeof phone !== 'string' || phone.length > 20) {
    return res.status(422).json({ error: 'Telefone invalido' })
  }

  const updated = await prisma.user.update({ where: { id: req.userId }, data: { phone } })
  res.json({ phone: updated.phone })
})

router.post('/personal-code/regenerate', async (req, res) => {
  const personalCode = await generateUniquePersonalCode()
  const updated = await prisma.user.update({
    where: { id: req.userId },
    data: { personalCode },
  })
  res.json({ personalCode: updated.personalCode })
})

export default router
