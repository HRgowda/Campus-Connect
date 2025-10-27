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
import axios from "axios"
import { useRouter } from "next/navigation"
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils"

type SignupFormProps = React.ComponentProps<"div"> & {
  userType: "student" | "professor"
}

export function SignupForm({ className, userType, ...props }: SignupFormProps) {
  const router = useRouter()

  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [usn, setUsn] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const handleSignup = async (e: React.FormEvent) =>{
    e.preventDefault()
    setLoading(true)

    try {

      const endpoint = userType == "student" ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/student/signup` : `${process.env.NEXT_PUBLIC_BACKEND_URL}/professor/signup`

      const payload = userType == "student" ? {name, email, usn, password} : {name, email, password}

      const response = await axios.post(endpoint, payload)

      showSuccessToast("Account created successfully!")

      setTimeout(() => {
        router.push(userType == "student" ? "/student/signin" : "/professor/signin")
      }, 2000)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || "Signup failed, please try again"

      showErrorToast(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border rounded-xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-card-foreground">Sign up for an account</CardTitle>
          <CardDescription className="text-muted-foreground">
            {userType === "student"
              ? "Create a student account by providing your details"
              : "Create a professor account by providing your details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              {/* Name field - common */}
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="border-input"
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email field - common */}
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-input"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* USN - only for students */}
              {userType === "student" && (
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
              )}

              {/* Password - common */}
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
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href={userType == "student" ? "/student/signin" : "/professor/signin"} className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
