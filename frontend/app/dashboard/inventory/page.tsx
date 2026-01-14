"use client"

import { useState, useEffect } from "react"
import { Package, AlertTriangle } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { useSettings } from "@/context/settings-context"
import { feedsApi } from "@/lib/api"

interface Material {
  id: number
  name: string
  quantity: number
  unit: string
  minStock: number
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { settings } = useSettings()

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      const data = await feedsApi.getFeeds()
      setMaterials(data)
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    { key: "name", header: "اسم المادة" },
    {
      key: "quantity",
      header: "الكمية المتوفرة",
      render: (item: Material) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">
            {item.quantity.toLocaleString()} {item.unit}
          </span>
          {item.quantity <= item.minStock && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
              <AlertTriangle className="h-3 w-3" />
              منخفض
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="المخزون"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">إجمالي المواد المتوفرة</p>
          <p className="text-2xl font-bold text-foreground mt-1">{materials.length}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">مواد منخفضة المخزون</p>
          <p className="text-2xl font-bold text-warning mt-1">
            {materials.filter((m) => m.quantity <= m.minStock).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={materials}
        isLoading={isLoading}
        emptyState={{
          title: "المخزون فارغ",
          description: "لا توجد مواد في المخزون حالياً",
          icon: <Package className="h-8 w-8 text-muted-foreground" />,
        }}
      />
    </DashboardLayout>
  )
}
