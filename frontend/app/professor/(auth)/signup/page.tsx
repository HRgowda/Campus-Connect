import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#070707]">
      <div className="w-full max-w-sm">
        <SignupForm userType="professor"/>
      </div>
    </div>
  )
}