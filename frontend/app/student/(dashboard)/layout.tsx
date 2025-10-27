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
        <div className="flex min-h-screen w-full">
          {/* Sidebar */}
          <div className="flex-shrink-0">
            <AppSidebar userType="student" />
          </div>

          {/* Content area */}
          <div className="flex flex-col flex-1 w-full bg-background">
            <SidebarTrigger className="pt-8 pl-3 text-foreground hover:bg-accent" />
            <main className="flex-1 w-full overflow-auto px-6 py-8 bg-gradient-to-br from-background to-muted/20">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </AuthProvider>
  )
}
