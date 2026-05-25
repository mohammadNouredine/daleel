import axios from "axios"
import { getAuthToken } from "@/lib/api/auth-token"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000"

const axiosClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosClient.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config
  }

  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default axiosClient

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
  }
}
