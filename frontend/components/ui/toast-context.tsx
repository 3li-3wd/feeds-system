"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    info: <AlertCircle className="h-5 w-5 text-primary" />,
  }

  const bgColors = {
    success: "bg-success/10 border-success/30",
    error: "bg-destructive/10 border-destructive/30",
    info: "bg-primary/10 border-primary/30",
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-slide-in ${bgColors[toast.type]}`}
          >
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium text-foreground">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="rounded-md p-1 hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
