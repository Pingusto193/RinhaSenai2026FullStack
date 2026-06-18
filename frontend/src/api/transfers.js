import { apiRequest } from './client.js'

export const getSentTransfers = (limit = 10) =>
  apiRequest('GET', `/transfers/sent?limit=${limit}`)

export const createTransfer = (receiverPersonalCode, amountCents) =>
  apiRequest('POST', '/transfers', { receiverPersonalCode, amountCents })
