'use client'

import { ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/AuthProvider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function ProfessorLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar userType="professor" />
        <SidebarTrigger />
        <main>
          {children}
        </main>
        <Toaster />
      </SidebarProvider>
    </AuthProvider>
  )
}