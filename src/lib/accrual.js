import prisma from '../db.js'
import { dayKeyOf, monthKeyOf, daysBetween } from './dateKey.js'

const FIXED_ANNUAL_RATE = 0.105
const VARIABLE_MIN_MONTHLY = -0.04
const VARIABLE_MAX_MONTHLY = 0.06

function randomVariableMultiplier() {
  return VARIABLE_MIN_MONTHLY + Math.random() * (VARIABLE_MAX_MONTHLY - VARIABLE_MIN_MONTHLY)
}

export async function applyAccrual(investment) {
  const now = new Date()
  let { principalCents, lastAccrualAt, type } = investment

  if (principalCents > 0) {
    if (type === 'FIXED') {
      const days = daysBetween(lastAccrualAt, now)
      if (days >= 1) {
        principalCents = Math.round(principalCents * (1 + FIXED_ANNUAL_RATE) ** (days / 365))
        lastAccrualAt = now
      }
    } else if (type === 'VARIABLE') {
      if (monthKeyOf(now) !== monthKeyOf(lastAccrualAt)) {
        principalCents = Math.round(principalCents * (1 + randomVariableMultiplier()))
        lastAccrualAt = now
      }
    }
  } else {
    lastAccrualAt = now
  }

  if (principalCents !== investment.principalCents || lastAccrualAt !== investment.lastAccrualAt) {
    investment = await prisma.investment.update({
      where: { id: investment.id },
      data: { principalCents, lastAccrualAt },
    })
  }

  await ensureTodaySnapshot(investment.userId, principalCents)

  return investment
}

export async function ensureTodaySnapshot(userId, valueCents) {
  const dayKey = dayKeyOf(new Date())
  await prisma.investmentSnapshot.upsert({
    where: { userId_dayKey: { userId, dayKey } },
    update: { valueCents },
    create: { userId, dayKey, valueCents },
  })
}
