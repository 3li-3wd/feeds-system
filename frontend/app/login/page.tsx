"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Factory, Eye, EyeOff, Loader2 } from "lucide-react"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { SettingsProvider } from "@/context/settings-context"
import { ToastProvider, useToast } from "@/components/ui/toast-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const { login, token, isLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && token) {
      router.replace("/dashboard")
    }
  }, [token, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور")
      return
    }

    setIsSubmitting(true)
    try {
      await login(username, password)
      showToast("تم تسجيل الدخول بنجاح", "success")
      router.replace("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 animate-slide-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-2xl bg-primary/10 p-4 mb-4">
              <Factory className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">نظام إدارة المعمل</h1>
            <p className="text-sm text-muted-foreground mt-1">تسجيل الدخول إلى لوحة التحكم</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                disabled={isSubmitting}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  disabled={isSubmitting}
                  className="h-12 pl-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-semibold">
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">
              للتجربة: اسم المستخدم <span className="font-mono text-foreground">admin</span> وكلمة المرور{" "}
              <span className="font-mono text-foreground">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </SettingsProvider>
    </ToastProvider>
  )
}
