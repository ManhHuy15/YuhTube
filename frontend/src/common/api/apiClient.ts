import axios from 'axios'
import { getAuthIdToken } from '../../features/auth/services/auth.service'

export const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, ''),
})

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthIdToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // Continue without token if unauthenticated
  }
  return config
})

