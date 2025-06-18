"use client"
import { useEffect, useState, ReactNode, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import AuthContext from "@/app/context/AuthContext"
import { useAtom } from "jotai"
import { userAtom } from "@/app/atoms/atoms"

interface User {
  id: string
  email?: string
  usn?: string
  role: "student" | "professor", 
  name: string
}

interface Props { children: ReactNode }

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)
  const [, setUserAtom] = useAtom(userAtom)

  useEffect(() => {
    if (!hasRedirected.current) checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const res = await axiosInstance.get("/me")
      const userData: User = res.data
      setUser(userData)

      setUserAtom({
        id: userData.id,
        name: userData.name,
        email: userData.email ?? null,
        role: userData.role
      }) // global atom to store user data
      
      localStorage.setItem("role", userData.role)

      if (!hasRedirected.current) {
        if (userData.role === "student" && ["/", "/student/signin"].includes(pathname)) {
          hasRedirected.current = true
          router.replace("/student/home")
        } else if (userData.role === "professor" && ["/", "/professor/signin"].includes(pathname)) {
          hasRedirected.current = true
          router.replace("/professor/home")
        }
      }
    } catch (err) {
      setUser(null)
      const role = localStorage.getItem("role")

      if (!hasRedirected.current) {
        if (pathname === "/") {
          hasRedirected.current = true
          router.replace(role === "student"
            ? "/student/signin"
            : role === "professor"
            ? "/professor/signin"
            : "/")
        } else if (role === "student" && pathname !== "/student/signin") {
          hasRedirected.current = true
          router.replace("/student/signin")
        } else if (role === "professor" && pathname !== "/professor/signin") {
          hasRedirected.current = true
          router.replace("/professor/signin")
        } else if (!role && !["/student/signin", "/professor/signin", "/student/signup", "/professor/signup", "/"].includes(pathname)) {
          hasRedirected.current = true
          router.replace("/")
        }
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout }}>
      {isLoading ? null : children}
    </AuthContext.Provider>
  )
}
