import axios from "axios"
import { store } from "../store/store"
import { logOut, setCredentials } from "../store/auth/authSlice"


export const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true
})

const refreshApi = axios.create({
  baseURL: "http://localhost:8080",
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
        const token = res.data.tocken

        store.dispatch(setCredentials({ token }))
        originalRequest.headers.Authorization = `Bearer ${token}`

        return api(originalRequest)
      } catch (err) {
        store.dispatch(logOut())
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export { refreshApi }
