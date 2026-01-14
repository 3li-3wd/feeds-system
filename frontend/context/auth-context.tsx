"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authApi } from "@/lib/api"

interface User {
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken && storedUser) {
      authApi.verifyToken(storedToken).then(({ valid }) => {
        if (valid) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } else {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
        }
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login(username, password)
    setToken(response.token)
    setUser(response.user)
    localStorage.setItem("auth_token", response.token)
    localStorage.setItem("auth_user", JSON.stringify(response.user))
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }, [])

  return <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
