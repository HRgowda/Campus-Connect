import { LoginForm } from "@/components/login-form"

export default function SigninPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#070707]">
      <div className="w-full max-w-sm">
        <LoginForm userType="student"/>
      </div>
    </div>
  )
}