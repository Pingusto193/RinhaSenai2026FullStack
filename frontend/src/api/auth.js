import { apiRequest } from './client.js'

export const register = (name, email, password) =>
  apiRequest('POST', '/auth/register', { name, email, password })

export const login = (email, password) =>
  apiRequest('POST', '/auth/login', { email, password })

export const logout = () => apiRequest('POST', '/auth/logout')

export const me = () => apiRequest('GET', '/auth/me')
