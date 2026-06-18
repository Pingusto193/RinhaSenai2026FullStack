import { apiRequest } from './client.js'

export const getRecentExpenses = (limit = 10) =>
  apiRequest('GET', `/expenses/recent?limit=${limit}`)

export const getExpensesAggregate = (period) =>
  apiRequest('GET', `/expenses/aggregate?period=${period}`)
