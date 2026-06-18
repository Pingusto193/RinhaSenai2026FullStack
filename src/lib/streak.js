import prisma from '../db.js'
import { dayKeyOf, parseDayKey, daysBetween } from './dateKey.js'

const MIN_ACTIVE_CENTS = 1000

export async function applyStreak(userId, principalCents) {
  let streak = await prisma.streak.findUnique({ where: { userId } })
  if (!streak) {
    streak = await prisma.streak.create({ data: { userId } })
  }

  const today = dayKeyOf(new Date())

  if (principalCents < MIN_ACTIVE_CENTS) {
    if (streak.current !== 0) {
      streak = await prisma.streak.update({ where: { userId }, data: { current: 0 } })
    }
    return streak
  }

  if (streak.lastCountedAt === today) return streak

  let nextCurrent = 1
  if (streak.lastCountedAt) {
    const days = daysBetween(parseDayKey(streak.lastCountedAt), parseDayKey(today))
    nextCurrent = days >= 1 ? streak.current + 1 : streak.current
  }

  streak = await prisma.streak.update({
    where: { userId },
    data: {
      current: nextCurrent,
      lastCountedAt: today,
      record: Math.max(streak.record, nextCurrent),
    },
  })

  return streak
}
