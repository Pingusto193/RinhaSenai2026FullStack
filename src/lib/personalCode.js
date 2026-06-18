import crypto from 'node:crypto'
import prisma from '../db.js'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const LENGTH = 8

function randomCode() {
  let code = ''
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)]
  }
  return code
}

export async function generateUniquePersonalCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode()
    const existing = await prisma.user.findUnique({ where: { personalCode: code } })
    if (!existing) return code
  }
  throw new Error('Nao foi possivel gerar um codigo pessoal unico')
}
