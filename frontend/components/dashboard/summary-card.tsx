"use client"

import type React from "react"
import { Skeleton } from "@/components/ui/loading-skeleton"

interface SummaryCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  isLoading?: boolean
  colorClass?: string
}

export function SummaryCard({
  title,
  value,
  icon,
  trend,
  isLoading,
  colorClass = "bg-primary/10 text-primary",
}: SummaryCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs font-medium ${trend.isPositive ? "text-success" : "text-destructive"}`}>
              {trend.isPositive ? "+" : ""}
              {trend.value}% من الشهر الماضي
            </p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colorClass}`}>{icon}</div>
      </div>
    </div>
  )
}
