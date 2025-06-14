import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/AuthProvider" 
import { LoaderProvider } from "./context/LoaderContext"
import GlobalLoader from "@/components/GlobalLoader"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Campus Connect",
  description: "",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black/90 text-white min-h-screen`}>
      <LoaderProvider >
        <GlobalLoader />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </LoaderProvider>
      </body>
    </html>
  )
}
