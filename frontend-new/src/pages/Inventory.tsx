
import type React from "react"
import { useState, useEffect } from "react"
import { PackageSearch, AlertTriangle } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { feedsApi } from "@/lib/api"

interface Material {
    id: number
    name: string
    quantity: number
    unit?: string
    minStock: number
    status: "good" | "low"
}

export default function InventoryPage() {
    const [materials, setMaterials] = useState<Material[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadInventory()
    }, [])

    const loadInventory = async () => {
        try {
            const data = await feedsApi.getFeeds()
            // Map backend fields (quantity_kg) to frontend (quantity)
            const mapped = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity_kg || 0,
                unit: "كغ",
                minStock: 500, // Default for now
                status: (item.quantity_kg || 0) < 500 ? "low" : "good"
            }))
            setMaterials(mapped)
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
                        {(item.quantity || 0).toLocaleString()} {item.unit || "كغ"}
                    </span>
                    {(item.quantity || 0) <= (item.minStock || 500) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            منخفض
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "status",
            header: "الحالة",
            render: (item: Material) => {
                const isLow = (item.quantity || 0) <= (item.minStock || 500)
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isLow
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                        }`}>
                        {isLow ? "مخزون منخفض" : "جيد"}
                    </span>
                )
            },
        },
    ]

    return (
        <DashboardLayout title="المخزون">
            <DataTable
                columns={columns}
                data={materials}
                isLoading={isLoading}
                emptyState={{
                    title: "لا توجد مواد",
                    description: "ابدأ بإضافة مواد للمخزون",
                    icon: <PackageSearch className="h-8 w-8 text-muted-foreground" />,
                }}
            />
        </DashboardLayout>
    )
}
