import api from './api'

export const getAssignableUsers = async () => {
const response = await api.get('/accounts/assignable-users/')
return response.data
}