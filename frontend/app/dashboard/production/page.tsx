"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Factory, Trash2, Calendar } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { productionApi, inventoryApi } from "@/lib/api"

interface MaterialUsage {
  name: string
  quantity: number
}

interface ProductionOperation {
  id: number
  date: string
  product: string
  quantity: number
  materials: MaterialUsage[]
}

interface InventoryMaterial {
  id: number
  name: string
  quantity: number
  unit: string
}

const productTypes = ["علف دواجن", "علف أبقار", "علف أغنام", "علف أسماك", "علف أرانب"]

export default function ProductionPage() {
  const [operations, setOperations] = useState<ProductionOperation[]>([])
  const [materials, setMaterials] = useState<InventoryMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    product: productTypes[0],
    quantity: "",
    materials: [{ name: "", quantity: "" }] as { name: string; quantity: string }[],
  })

  const { showToast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [opsData, matsData] = await Promise.all([productionApi.getOperations(), inventoryApi.getMaterials()])
      setOperations(opsData)
      setMaterials(matsData)
    } finally {
      setIsLoading(false)
    }
  }

  const openAddModal = () => {
    setFormData({
      product: productTypes[0],
      quantity: "",
      materials: [{ name: materials[0]?.name || "", quantity: "" }],
    })
    setIsModalOpen(true)
  }

  const addMaterialRow = () => {
    setFormData({
      ...formData,
      materials: [...formData.materials, { name: materials[0]?.name || "", quantity: "" }],
    })
  }

  const removeMaterialRow = (index: number) => {
    if (formData.materials.length > 1) {
      setFormData({
        ...formData,
        materials: formData.materials.filter((_, i) => i !== index),
      })
    }
  }

  const updateMaterial = (index: number, field: "name" | "quantity", value: string) => {
    const updated = [...formData.materials]
    updated[index][field] = value
    setFormData({ ...formData, materials: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.quantity || formData.materials.some((m) => !m.name || !m.quantity)) {
      showToast("يرجى ملء جميع الحقول المطلوبة", "error")
      return
    }

    try {
      const operationData = {
        product: formData.product,
        quantity: Number(formData.quantity),
        materials: formData.materials.map((m) => ({
          name: m.name,
          quantity: Number(m.quantity),
        })),
      }

      const newOperation = await productionApi.addOperation(operationData)
      setOperations((prev) => [newOperation, ...prev])
      showToast("تم تسجيل عملية الإنتاج بنجاح", "success")
      setIsModalOpen(false)
    } catch {
      showToast("حدث خطأ أثناء تسجيل العملية", "error")
    }
  }

  const columns = [
    {
      key: "date",
      header: "التاريخ",
      render: (item: ProductionOperation) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {new Date(item.date).toLocaleDateString("ar-SA")}
        </div>
      ),
    },
    { key: "product", header: "المنتج" },
    {
      key: "quantity",
      header: "الكمية المنتجة",
      render: (item: ProductionOperation) => `${item.quantity.toLocaleString()} كغ`,
    },
    {
      key: "materials",
      header: "المواد المستهلكة",
      render: (item: ProductionOperation) => (
        <div className="flex flex-wrap gap-1">
          {item.materials.map((m, i) => (
            <span key={i} className="inline-block px-2 py-0.5 rounded-full bg-muted text-xs">
              {m.name}: {m.quantity} كغ
            </span>
          ))}
        </div>
      ),
    },
  ]

  // Calculate totals
  const totalProduction = operations.reduce((sum, op) => sum + op.quantity, 0)
  const totalOperations = operations.length

  return (
    <DashboardLayout
      title="الإنتاج"
      actions={
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          تسجيل إنتاج
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">إجمالي العمليات</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalOperations}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">إجمالي الإنتاج</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalProduction.toLocaleString()} كغ</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">متوسط الإنتاج لكل عملية</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {totalOperations > 0 ? Math.round(totalProduction / totalOperations).toLocaleString() : 0} كغ
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={operations}
        isLoading={isLoading}
        emptyState={{
          title: "لا توجد عمليات إنتاج",
          description: "ابدأ بتسجيل عمليات الإنتاج",
          icon: <Factory className="h-8 w-8 text-muted-foreground" />,
          action: (
            <Button onClick={openAddModal} variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              تسجيل إنتاج
            </Button>
          ),
        }}
      />

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل عملية إنتاج جديدة" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">نوع المنتج *</Label>
              <select
                id="product"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">الكمية المنتجة (كغ) *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>المواد المستهلكة *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMaterialRow} className="bg-transparent">
                <Plus className="h-4 w-4 ml-1" />
                إضافة مادة
              </Button>
            </div>

            {formData.materials.map((mat, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={mat.name}
                  onChange={(e) => updateMaterial(index, "name", e.target.value)}
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">اختر المادة</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.quantity} {m.unit} متاح)
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  value={mat.quantity}
                  onChange={(e) => updateMaterial(index, "quantity", e.target.value)}
                  placeholder="الكمية"
                  className="w-28"
                />
                {formData.materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMaterialRow(index)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              تسجيل العملية
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
