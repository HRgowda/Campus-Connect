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
      const res = await axiosInstance.get("/me", { withCredentials: true })
      const userData: User = res.data
      setUser(userData)

      const currentRole = localStorage.getItem("role")
      if (userData.role && userData.role !== currentRole) {
        localStorage.setItem("role", userData.role)
      }

      // Redirect logic for authenticated users
      if (userData.role === "student") {
        if (["/student/signin", "/"].includes(pathname)) {
          router.replace("/student/home")
        }
      } else if (userData.role === "professor") {
        if (["/professor/signin", "/"].includes(pathname)) {
          router.replace("/professor/home")
        }
      }

    } catch {
      setUser(null)
      const role = localStorage.getItem("role")

      // Redirect logic for unauthenticated users
      if (role === "student" && pathname !== "/student/signin") {
        router.replace("/student/signin")
      } else if (role === "professor" && pathname !== "/professor/signin") {
        router.replace("/professor/signin")
      } else if (!role && !["/student/signin", "/professor/signin"].includes(pathname)) {
        router.replace("/") // Default redirect if no role
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await axiosInstance.post("/logout", {}, { withCredentials: true })
    } catch {}
    localStorage.removeItem("role")
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout }}>
      {isLoading ? null : children}
    </AuthContext.Provider>
  )
}