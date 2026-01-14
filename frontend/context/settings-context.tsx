"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { settingsApi } from "@/lib/api"

interface Settings {
  factoryName: string
  phone: string
  currency: "SYP" | "USD"
  exchangeRate: number
  minStockAlert: number
}

interface SettingsContextType {
  settings: Settings
  isLoading: boolean
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>
  formatCurrency: (amount: number) => string
}

const defaultSettings: Settings = {
  factoryName: "معمل الأعلاف",
  phone: "",
  currency: "SYP",
  exchangeRate: 15000,
  minStockAlert: 500,
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    settingsApi.getSettings().then((data) => {
      setSettings(data as Settings)
      setIsLoading(false)
    })
  }, [])

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    await settingsApi.updateSettings(newSettings)
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const formatCurrency = useCallback(
    (amount: number) => {
      if (settings.currency === "USD") {
        const usdAmount = amount / settings.exchangeRate
        return `${usdAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })} $`
      }
      return `${amount.toLocaleString("en-US")} ل.س`
    },
    [settings.currency, settings.exchangeRate],
  )

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
