"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { AuthProvider } from "@/context/auth-context"
import { SettingsProvider } from "@/context/settings-context"
import { ToastProvider } from "@/components/ui/toast-context"

function HomeContent() {
  const router = useRouter()
  const { token, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [token, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <AuthProvider>
          <HomeContent />
        </AuthProvider>
      </SettingsProvider>
    </ToastProvider>
  )
}
