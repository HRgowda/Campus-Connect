"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useLoader } from "@/app/context/LoaderContext"
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils"

type LoginFormProps = React.ComponentProps<"div"> & {
  userType: "student" | "professor"
}

export function LoginForm({ className, userType, ...props }: LoginFormProps) {
  const router = useRouter()
  const {showLoader, hideLoader} = useLoader()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [usn, setUsn] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    showLoader()

    try {
      let res

      if (userType === "student") {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/student/signin`,
          { usn, password },
          { withCredentials: true }
        )
      } else {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/professor/signin`,
          { email, password },
          { withCredentials: true }
        )
      }

      if (res.data?.access_token) {
        // Save role in localStorage
        localStorage.setItem("role", userType)

        showSuccessToast("Logged in successfully!")

        setTimeout(() => {
          router.push(userType === "student" ? "/student/home" : "/professor/home")
        }, 2000)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || "Error while logging in. Please try again."
      showErrorToast(errorMessage)
    } finally {
      setLoading(false)
      hideLoader()
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border rounded-xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-card-foreground">Login to your account</CardTitle>
          <CardDescription className="text-muted-foreground">
            {userType === "student"
              ? "Enter your USN and password to login"
              : "Enter your email and password to login"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              {userType === "student" ? (
                <div className="grid gap-3">
                  <Label htmlFor="usn" className="text-sm font-medium text-foreground">USN</Label>
                  <Input
                    id="usn"
                    type="text"
                    placeholder="1DB22IS001"
                    className="border-input"
                    required
                    onChange={(e) => setUsn(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="border-input"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="border-input"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                href={userType === "student" ? "/student/signup" : "/professor/signup"}
                className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium"
              >
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
