"use client"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: "danger" | "warning" | "info"
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
  variant = "warning",
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const iconColors = {
    danger: "text-destructive bg-destructive/10",
    warning: "text-warning bg-warning/10",
    info: "text-accent bg-accent/10",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-card p-6 shadow-2xl animate-slide-in">
        <div className="flex items-start gap-4">
          <div className={`rounded-full p-3 ${iconColors[variant]}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={variant === "danger" ? "destructive" : "default"} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
