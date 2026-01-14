"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, AlertTriangle, Package } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { useSettings } from "@/context/settings-context"
import { inventoryApi } from "@/lib/api"

interface Material {
  id: number
  name: string
  quantity: number
  unit: string
  minStock: number
  price: number
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "كغ",
    minStock: "",
    price: "",
  })

  const { showToast } = useToast()
  const { formatCurrency, settings } = useSettings()

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      const data = await inventoryApi.getMaterials()
      setMaterials(data)
    } finally {
      setIsLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingMaterial(null)
    setFormData({ name: "", quantity: "", unit: "كغ", minStock: "", price: "" })
    setIsModalOpen(true)
  }

  const openEditModal = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      name: material.name,
      quantity: material.quantity.toString(),
      unit: material.unit,
      minStock: material.minStock.toString(),
      price: material.price.toString(),
    })
    setIsModalOpen(true)
  }

  const openDeleteDialog = (material: Material) => {
    setDeletingMaterial(material)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.quantity || !formData.price) {
      showToast("يرجى ملء جميع الحقول المطلوبة", "error")
      return
    }

    try {
      const materialData = {
        name: formData.name,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        minStock: Number(formData.minStock) || settings.minStockAlert,
        price: Number(formData.price),
      }

      if (editingMaterial) {
        await inventoryApi.updateMaterial(editingMaterial.id, materialData)
        setMaterials((prev) => prev.map((m) => (m.id === editingMaterial.id ? { ...m, ...materialData } : m)))
        showToast("تم تحديث المادة بنجاح", "success")
      } else {
        const newMaterial = await inventoryApi.addMaterial(materialData)
        setMaterials((prev) => [...prev, newMaterial])
        showToast("تم إضافة المادة بنجاح", "success")
      }
      setIsModalOpen(false)
    } catch {
      showToast("حدث خطأ أثناء حفظ المادة", "error")
    }
  }

  const handleDelete = async () => {
    if (!deletingMaterial) return

    try {
      await inventoryApi.deleteMaterial(deletingMaterial.id)
      setMaterials((prev) => prev.filter((m) => m.id !== deletingMaterial.id))
      showToast("تم حذف المادة بنجاح", "success")
    } catch {
      showToast("حدث خطأ أثناء حذف المادة", "error")
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingMaterial(null)
    }
  }

  const columns = [
    { key: "name", header: "اسم المادة" },
    {
      key: "quantity",
      header: "الكمية",
      render: (item: Material) => (
        <div className="flex items-center gap-2">
          <span>
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
    {
      key: "minStock",
      header: "الحد الأدنى",
      render: (item: Material) => `${item.minStock.toLocaleString()} ${item.unit}`,
    },
    {
      key: "price",
      header: "السعر",
      render: (item: Material) => formatCurrency(item.price),
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (item: Material) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openEditModal(item)
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="تعديل"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              openDeleteDialog(item)
            }}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
            title="حذف"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="المخزون"
      actions={
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مادة
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">إجمالي المواد</p>
          <p className="text-2xl font-bold text-foreground mt-1">{materials.length}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">مواد منخفضة المخزون</p>
          <p className="text-2xl font-bold text-warning mt-1">
            {materials.filter((m) => m.quantity <= m.minStock).length}
          </p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">إجمالي قيمة المخزون</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatCurrency(materials.reduce((sum, m) => sum + m.quantity * m.price, 0))}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={materials}
        isLoading={isLoading}
        emptyState={{
          title: "لا توجد مواد",
          description: "ابدأ بإضافة مواد أولية للمخزون",
          icon: <Package className="h-8 w-8 text-muted-foreground" />,
          action: (
            <Button onClick={openAddModal} variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              إضافة مادة
            </Button>
          ),
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? "تعديل مادة" : "إضافة مادة جديدة"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المادة *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: ذرة صفراء"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">الكمية *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">الوحدة</Label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="كغ">كيلوغرام</option>
                <option value="طن">طن</option>
                <option value="لتر">لتر</option>
                <option value="قطعة">قطعة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStock">الحد الأدنى</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                placeholder={settings.minStockAlert.toString()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">السعر *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingMaterial ? "حفظ التغييرات" : "إضافة"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="حذف المادة"
        message={`هل أنت متأكد من حذف "${deletingMaterial?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setDeletingMaterial(null)
        }}
      />
    </DashboardLayout>
  )
}
