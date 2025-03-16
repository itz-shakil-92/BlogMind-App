import axios from "axios"

// Set the correct base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Auth-specific API functions
export const authApi = {
  // Register a new user
  register: async (userData: {
    email: string
    name: string
    password: string
    bio?: string
    avatar?: string
  }) => {
    const response = await apiClient.post("/api/auth/register", userData)
    return response.data
  },

  // Login with email and password
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams() // Use URLSearchParams for correct encoding
    formData.append("username", email) // OAuth2 uses "username" for email
    formData.append("password", password)

    try {
      const response = await apiClient.post("/api/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      const data = response.data
      localStorage.setItem("token", data.access_token) // Store token
      return data
    } catch (error: any) {
      console.error("Login Failed:", error.response?.data || error.message)
      throw error
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/api/users/me")
      return response.data
    } catch (error: any) {
      console.error("Error fetching user:", error.response?.data || error.message)
      throw error
    }
  },

  // Update user profile
  updateUser: async (userData: {
    name?: string
    email?: string
    bio?: string
    avatar?: string
  }) => {
    try {
      const response = await apiClient.put("/api/users/me", userData)
      return response.data
    } catch (error: any) {
      console.error("Profile update failed:", error.response?.data || error.message)
      throw error
    }
  },
}

export default apiClient
