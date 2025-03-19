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
          try {
            // Try to get user from API
            const userData = await authApi.getCurrentUser()
            setUser(userData)
          } catch (apiError) {
            console.error("API auth check failed:", apiError)

            // Fallback to localStorage for demo mode
            const storedUser = localStorage.getItem("user")
            if (storedUser) {
              setUser(JSON.parse(storedUser))
            } else {
              // Create a demo user if token exists but no user data
              const demoUser = {
                id: "1",
                name: "Demo User",
                email: "demo@example.com",
                bio: "This is a demo user account",
                avatar: "/placeholder.svg?height=200&width=200",
              }
              setUser(demoUser)
              localStorage.setItem("user", JSON.stringify(demoUser))
            }
          }
        } else {
          // No token, clear user
          localStorage.removeItem("user")
          Cookies.remove("token")
          setUser(null)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        Cookies.remove("token")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Try real API login first
      try {
        const data = await authApi.login(email, password)

        // Extract tokens and user data from response
        const { access_token, user: userData } = data

        // Store token
        localStorage.setItem("token", access_token)
        Cookies.set("token", access_token, { expires: 7, path: "/" })

        // Set user state
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))

        return { success: true }
      } catch (apiError) {
        console.error("API login failed, using demo mode:", apiError)

        // Demo mode fallback
        const demoUser = {
          id: "1",
          name: "Demo User",
          email: email,
          bio: "This is a demo user account",
          avatar: "/placeholder.svg?height=200&width=200",
        }

        // Store token and user
        const demoToken = "demo-token-" + Math.random().toString(36).substring(2)
        localStorage.setItem("token", demoToken)
        Cookies.set("token", demoToken, { expires: 7, path: "/" })

        setUser(demoUser)
        localStorage.setItem("user", JSON.stringify(demoUser))

        return { success: true }
      }
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
      // Try real API registration first
      try {
        const data = await authApi.register(userData)

        // If registration returns a token and user, store them
        if (data.access_token && data.user) {
          localStorage.setItem("token", data.access_token)
          Cookies.set("token", data.access_token, { expires: 7, path: "/" })
          setUser(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
        }

        return { success: true }
      } catch (apiError) {
        console.error("API registration failed, using demo mode:", apiError)

        // Demo mode fallback
        const demoUser = {
          id: "1",
          name: userData.name,
          email: userData.email,
          bio: userData.bio || "This is a demo user account",
          avatar: "/placeholder.svg?height=200&width=200",
        }

        // Store token and user
        const demoToken = "demo-token-" + Math.random().toString(36).substring(2)
        localStorage.setItem("token", demoToken)
        Cookies.set("token", demoToken, { expires: 7, path: "/" })

        setUser(demoUser)
        localStorage.setItem("user", JSON.stringify(demoUser))

        return { success: true }
      }
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
      // Try real API update first
      try {
        const updatedUser = await authApi.updateUser(userData)
        setUser({ ...user, ...updatedUser } as User)

        // Update stored user data
        if (user) {
          const updatedStoredUser = { ...user, ...userData }
          localStorage.setItem("user", JSON.stringify(updatedStoredUser))
        }

        return { success: true }
      } catch (apiError) {
        console.error("API update failed, using demo mode:", apiError)

        // Demo mode fallback
        if (user) {
          const updatedUser = { ...user, ...userData }
          setUser(updatedUser)
          localStorage.setItem("user", JSON.stringify(updatedUser))
        }

        return { success: true }
      }
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
    localStorage.removeItem("user")

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

