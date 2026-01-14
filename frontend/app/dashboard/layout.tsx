"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { SettingsProvider } from "@/context/settings-context"
import { ToastProvider } from "@/components/ui/toast-context"

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login")
    }
  }, [token, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return <>{children}</>
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <SettingsProvider>
        <AuthProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </AuthProvider>
      </SettingsProvider>
    </ToastProvider>
  )
}
