import { apiRequest, apiUpload } from './client.js'

export const getAccount = () => apiRequest('GET', '/account')
export const updateAccount = (data) => apiRequest('PATCH', '/account', data)
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return apiUpload('/account/avatar', formData)
}
export const changePassword = (currentPassword, newPassword) =>
  apiRequest('POST', '/account/password', { currentPassword, newPassword })
export const changeEmail = (newEmail, currentPassword) =>
  apiRequest('POST', '/account/email', { newEmail, currentPassword })
export const changePhone = (phone) => apiRequest('POST', '/account/phone', { phone })
export const regeneratePersonalCode = () =>
  apiRequest('POST', '/account/personal-code/regenerate')
