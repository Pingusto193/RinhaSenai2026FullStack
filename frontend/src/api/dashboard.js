import { apiRequest } from './client.js'

export const getDashboard = () => apiRequest('GET', '/dashboard')
export const getLedger = (page = 1, limit = 20) =>
  apiRequest('GET', `/dashboard/ledger?page=${page}&limit=${limit}`)
