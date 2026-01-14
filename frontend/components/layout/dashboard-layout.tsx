"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar, MobileMenuButton } from "./sidebar"
import { useSettings } from "@/context/settings-context"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  actions?: React.ReactNode
}

export function DashboardLayout({ children, title, actions }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="lg:mr-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-xl font-bold text-foreground">{title}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{settings.factoryName}</p>
              </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
