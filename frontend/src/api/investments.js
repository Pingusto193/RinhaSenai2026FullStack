import { apiRequest } from './client.js'

export const getInvestment = () => apiRequest('GET', '/investments')
export const setInvestmentType = (type) => apiRequest('POST', '/investments/type', { type })
export const depositInvestment = (amountCents) =>
  apiRequest('POST', '/investments/deposit', { amountCents })
export const withdrawInvestment = (amountCents) =>
  apiRequest('POST', '/investments/withdraw', { amountCents })
export const getInvestmentHistory = (period) =>
  apiRequest('GET', `/investments/history?period=${period}`)
