'use client'

import { ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/AuthProvider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
            <AppSidebar userType="student" />
            <SidebarTrigger className="pt-8 pl-3" />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </AuthProvider>
  )
}
