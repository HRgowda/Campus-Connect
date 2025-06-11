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
import { boolean } from "zod"
import { toast } from "sonner"

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

      toast(
        "Account created successfully!", {
          style:{
            backgroundColor: "#14532D",
            color: "#fff",
            border: "1px solid #4ADE80",
          }
        }
      )

      setTimeout(() => {
        router.push(userType == "student" ? "/student/signin" : "/professor/signin")
      }, 2000)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || "Signup failed, please try again"

      toast(errorMessage, {
        style: {
          backgroundColor: "#450a0a",
          color: "#fff",
          border: "1px solid #f87171"
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 bg-[#212121e6] text-white", className)} {...props}>
      <Card className="border-zinc-500 rounded-xl">
        <CardHeader>
          <CardTitle>Sign up for an account</CardTitle>
          <CardDescription>
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="border-zinc-500"
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email field - common */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-zinc-500"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* USN - only for students */}
              {userType === "student" && (
                <div className="grid gap-3">
                  <Label htmlFor="usn">USN</Label>
                  <Input
                    id="usn"
                    type="text"
                    placeholder="1DB22IS001"
                    className="border-zinc-500"
                    required
                    onChange={(e) => setUsn(e.target.value)}
                  />
                </div>
              )}

              {/* Password - common */}
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="border-zinc-500"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-white/90 text-black">
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href={userType == "student" ? "/student/signin" : "/professor/signin"} className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
