"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"

interface User {
  id: string
  name: string
  email: string
  bio?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
  name: string
  email: string
  password: string
  bio?: string
  avatar?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("token")
        Cookies.remove("token")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password)

      // Extract tokens and user data from response
      const { access_token, user: userData } = data

      // Store token
      localStorage.setItem("token", access_token)
      Cookies.set("token", access_token, { expires: 7, path: "/" })

      // Set user state
      setUser(userData)

      return { success: true }
    } catch (error: any) {
      console.error("Login failed:", error)
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed. Please check your credentials.",
      }
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const data = await authApi.register(userData)

      // If registration returns a token and user, store them
      if (data.access_token && data.user) {
        localStorage.setItem("token", data.access_token)
        Cookies.set("token", data.access_token, { expires: 7, path: "/" })
        setUser(data.user)
      }

      return { success: true }
    } catch (error: any) {
      console.error("Registration failed:", error)
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed. Please try again.",
      }
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateUser(userData)
      setUser({ ...user, ...updatedUser })
      return { success: true }
    } catch (error: any) {
      console.error("Profile update failed:", error)
      return {
        success: false,
        error: error.response?.data?.detail || "Profile update failed. Please try again.",
      }
    }
  }

  const logout = () => {
    // Clear local storage
    localStorage.removeItem("token")

    // Clear cookies
    Cookies.remove("token")

    // Reset user state
    setUser(null)

    // Redirect to login
    router.push("/login")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

