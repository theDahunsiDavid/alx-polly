"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { User } from "../types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Check for existing auth token and validate user session
    const checkAuth = async () => {
      try {
        // Check localStorage or cookies for auth token
        const token = localStorage.getItem("auth-token")
        if (token) {
          // TODO: Validate token with backend
          // For now, just simulate a user
          setUser({
            id: "1",
            email: "user@example.com",
            name: "Demo User",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // TODO: Implement actual login API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      const mockUser: User = {
        id: "1",
        email,
        name: "Demo User",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      setUser(mockUser)
      localStorage.setItem("auth-token", "mock-token")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // TODO: Implement actual registration API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      const mockUser: User = {
        id: "1",
        email,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      setUser(mockUser)
      localStorage.setItem("auth-token", "mock-token")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth-token")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


