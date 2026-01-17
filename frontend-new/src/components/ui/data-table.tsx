"use client"

import type React from "react"
import { EmptyState } from "./empty-state"
import { Skeleton } from "./loading-skeleton"

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyState?: {
    title: string
    description?: string
    icon?: React.ReactNode
    action?: React.ReactNode
  }
  onRowClick?: (item: T) => void
}

export function DataTable<T extends { id: number | string }>({
  columns,
  data,
  isLoading,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="rounded-xl bg-card shadow-sm">
        <EmptyState {...emptyState} />
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-right text-sm font-semibold text-foreground ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors hover:bg-muted/30 ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-sm text-foreground ${col.className || ""}`}>
                    {col.render ? col.render(item) : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
