import axios from "axios"
import { store } from "../store/store"
import { logOut, setCredentials } from "../store/auth/authSlice"
import { toast } from "react-toastify"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = store.getState()?.auth?.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 429) {
      const message = error.response?.data?.error || 'Trop de tentatives. R\\u00e9essayez dans 15 minutes.'
      sessionStorage.setItem('rateLimitMessage', message)
      window.location.href = '/'
      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      // Check if inactive
      const user = JSON.parse(
        localStorage.getItem('user') || 'null'
      )
      store.dispatch(logOut())
      if (user?.isActive === false) {
        window.location.href = '/compte-inactif'
      } else {
        window.location.href = '/non-autorise'
      }
      return Promise.reject(error)
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true

      try {
        const res = await refreshApi.post("/auth/refresh")
        const token = res.data.token   // Fixed: was res.data.tocken (typo)

        store.dispatch(setCredentials({ token }))
        originalRequest.headers.Authorization = `Bearer ${token}`

        return api(originalRequest)
      } catch (err) {
        store.dispatch(logOut())
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        window.location.href = '/'
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export { refreshApi }
