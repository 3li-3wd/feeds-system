"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Users, Phone, MapPin } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { customersApi } from "@/lib/api"

interface Customer {
  id: number
  name: string
  phone: string
  address: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })

  const { showToast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getCustomers()
      setCustomers(data)
    } finally {
      setIsLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingCustomer(null)
    setFormData({ name: "", phone: "", address: "" })
    setIsModalOpen(true)
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    })
    setIsModalOpen(true)
  }

  const openDeleteDialog = (customer: Customer) => {
    setDeletingCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      showToast("يرجى إدخال اسم الزبون", "error")
      return
    }

    try {
      if (editingCustomer) {
        await customersApi.updateCustomer(editingCustomer.id, formData)
        setCustomers((prev) => prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...formData } : c)))
        showToast("تم تحديث بيانات الزبون بنجاح", "success")
      } else {
        const newCustomer = await customersApi.addCustomer(formData)
        setCustomers((prev) => [...prev, newCustomer])
        showToast("تم إضافة الزبون بنجاح", "success")
      }
      setIsModalOpen(false)
    } catch {
      showToast("حدث خطأ أثناء حفظ البيانات", "error")
    }
  }

  const handleDelete = async () => {
    if (!deletingCustomer) return

    try {
      await customersApi.deleteCustomer(deletingCustomer.id)
      setCustomers((prev) => prev.filter((c) => c.id !== deletingCustomer.id))
      showToast("تم حذف الزبون بنجاح", "success")
    } catch {
      showToast("حدث خطأ أثناء حذف الزبون", "error")
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingCustomer(null)
    }
  }

  const columns = [
    {
      key: "name",
      header: "اسم الزبون",
      render: (item: Customer) => <span className="font-semibold text-foreground">{item.name}</span>,
    },
    {
      key: "phone",
      header: "رقم الهاتف",
      render: (item: Customer) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span dir="ltr">{item.phone}</span>
        </div>
      ),
    },
    {
      key: "address",
      header: "العنوان",
      render: (item: Customer) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="truncate max-w-xs">{item.address}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (item: Customer) => (
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
      title="الزبائن"
      actions={
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة زبون
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">إجمالي الزبائن</p>
          <p className="text-2xl font-bold text-foreground mt-1">{customers.length}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">زبائن جدد هذا الشهر</p>
          <p className="text-2xl font-bold text-success mt-1">3</p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        emptyState={{
          title: "لا يوجد زبائن",
          description: "ابدأ بإضافة زبائن جدد",
          icon: <Users className="h-8 w-8 text-muted-foreground" />,
          action: (
            <Button onClick={openAddModal} variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              إضافة زبون
            </Button>
          ),
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? "تعديل بيانات الزبون" : "إضافة زبون جديد"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الزبون *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="الاسم الكامل"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="09XXXXXXXX"
              dir="ltr"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="المدينة - الحي"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingCustomer ? "حفظ التغييرات" : "إضافة"}
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
        title="حذف الزبون"
        message={`هل أنت متأكد من حذف "${deletingCustomer?.name}"؟ سيتم حذف جميع البيانات المرتبطة به.`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setDeletingCustomer(null)
        }}
      />
    </DashboardLayout>
  )
}
