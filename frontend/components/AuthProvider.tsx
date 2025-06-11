"use client"

import { useEffect, useState, ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import AuthContext from "@/app/context/AuthContext"

interface User {
  id: string
  email?: string
  usn?: string
  role: "student" | "professor"
}

interface Props {
  children: ReactNode
}

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const res = await axiosInstance.get("/me")
      const userData: User = res.data
      setUser(userData)

      localStorage.setItem("role", userData.role)

      // If user is at login page but already logged in, redirect
      if (pathname === "/student/signin" && userData.role === "student") {
        router.push("/student/home")
      } else if (pathname === "/professor/signin" && userData.role === "professor") {
        router.push("/professor/home")
      }
    } catch {
      setUser(null)
      localStorage.removeItem("role")

      // Handle protected route redirect
      if (pathname.startsWith("/student")) {
        router.push("/student/signin")
      } else if (pathname.startsWith("/professor")) {
        router.push("/professor/signin")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await axiosInstance.post("/logout")
    } catch {}

    localStorage.removeItem("role")
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}