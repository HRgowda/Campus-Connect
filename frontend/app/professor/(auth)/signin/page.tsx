import { LoginForm } from "@/components/login-form"

export default function SigninPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-sm">
        <LoginForm userType="professor"/>
      </div>
    </div>
  )
}