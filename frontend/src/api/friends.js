import { apiRequest } from './client.js'

export const getFriends = () => apiRequest('GET', '/friends')
export const addFriend = (personalCode) => apiRequest('POST', '/friends', { personalCode })
