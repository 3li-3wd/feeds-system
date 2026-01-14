"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, FileText, Eye, CreditCard, CheckCircle, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { useSettings } from "@/context/settings-context"
import { invoicesApi, customersApi } from "@/lib/api"

// interface InvoiceItem {
//   product: string
//   quantity: number
//   price: number
// }

interface Invoice {
  id: number
  invoiceNumber: string
  customer: string
  date: string
  total: number
  paid: number
  type: string
}

interface Customer {
  id: number
  name: string
}

const productTypes = ["علف دواجن", "علف أبقار", "علف أغنام", "علف أسماك", "علف أرانب"]

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [formData, setFormData] = useState({
    customer: "",
    type: "مفرق",
    paid: "",
    items: [{ product: productTypes[0], quantity: "", price: "" }] as {
      product: string
      quantity: string
      price: string
    }[],
  })

  const { showToast } = useToast()
  const { formatCurrency, settings } = useSettings()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [invoicesData, customersData] = await Promise.all([invoicesApi.getInvoices(), customersApi.getCustomers()])
      setInvoices(invoicesData)
      setCustomers(customersData)
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setFormData({
      customer: customers[0]?.name || "",
      type: "مفرق",
      paid: "",
      items: [{ product: productTypes[0], quantity: "", price: "" }],
    })
    setIsCreateModalOpen(true)
  }

  const openViewModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setPaymentAmount("")
    setIsPaymentModalOpen(true)
  }

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: productTypes[0], quantity: "", price: "" }],
    })
  }

  const removeItemRow = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      })
    }
  }

  const updateItem = (index: number, field: "product" | "quantity" | "price", value: string) => {
    const updated = [...formData.items]
    updated[index][field] = value
    setFormData({ ...formData, items: updated })
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.price || 0)
    }, 0)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer || formData.items.some((item) => !item.quantity || !item.price)) {
      showToast("يرجى ملء جميع الحقول المطلوبة", "error")
      return
    }

    try {
      const invoiceData = {
        customer: formData.customer,
        type: formData.type,
        paid: Number(formData.paid) || 0,
        items: formData.items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      }

      const newInvoice = await invoicesApi.createInvoice(invoiceData)
      setInvoices((prev) => [newInvoice, ...prev])
      showToast("تم إنشاء الفاتورة بنجاح", "success")
      setIsCreateModalOpen(false)
    } catch {
      showToast("حدث خطأ أثناء إنشاء الفاتورة", "error")
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedInvoice || !paymentAmount) {
      showToast("يرجى إدخال مبلغ الدفعة", "error")
      return
    }

    const amount = Number(paymentAmount)
    const remaining = selectedInvoice.total - selectedInvoice.paid

    if (amount > remaining) {
      showToast("المبلغ أكبر من المتبقي", "error")
      return
    }

    try {
      await invoicesApi.recordPayment(selectedInvoice.id, amount)
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === selectedInvoice.id ? { ...inv, paid: inv.paid + amount } : inv)),
      )
      showToast("تم تسجيل الدفعة بنجاح", "success")
      setIsPaymentModalOpen(false)
    } catch {
      showToast("حدث خطأ أثناء تسجيل الدفعة", "error")
    }
  }

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.paid >= invoice.total) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
          <CheckCircle className="h-3 w-3" />
          مدفوعة
        </span>
      )
    } else if (invoice.paid > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
          <Clock className="h-3 w-3" />
          جزئية
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
          <Clock className="h-3 w-3" />
          غير مدفوعة
        </span>
      )
    }
  }

  const columns = [
    { key: "invoiceNumber", header: "رقم الفاتورة" },
    { key: "customer", header: "الزبون" },
    {
      key: "date",
      header: "التاريخ",
      render: (item: Invoice) => new Date(item.date).toLocaleDateString("ar-SA"),
    },
    {
      key: "type",
      header: "النوع",
      render: (item: Invoice) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === "جملة" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
        >
          {item.type}
        </span>
      ),
    },
    {
      key: "total",
      header: "الإجمالي",
      render: (item: Invoice) => formatCurrency(item.total),
    },
    {
      key: "paid",
      header: "المدفوع",
      render: (item: Invoice) => formatCurrency(item.paid),
    },
    {
      key: "status",
      header: "الحالة",
      render: (item: Invoice) => getStatusBadge(item),
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (item: Invoice) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openViewModal(item)
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="عرض"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </button>
          {item.paid < item.total && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                openPaymentModal(item)
              }}
              className="p-2 rounded-lg hover:bg-success/10 transition-colors"
              title="تسجيل دفعة"
            >
              <CreditCard className="h-4 w-4 text-success" />
            </button>
          )}
        </div>
      ),
    },
  ]

  // Calculate totals
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid, 0)
  const totalUnpaid = totalSales - totalPaid

  return (
    <DashboardLayout
      title="الفواتير"
      actions={
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          فاتورة جديدة
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">عدد الفواتير</p>
          <p className="text-2xl font-bold text-foreground mt-1">{invoices.length}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalSales)}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">المدفوع</p>
          <p className="text-2xl font-bold text-success mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">غير المدفوع</p>
          <p className="text-2xl font-bold text-destructive mt-1">{formatCurrency(totalUnpaid)}</p>
        </div>
      </div>

      {/* Currency Notice */}
      <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        العملة الحالية: {settings.currency === "SYP" ? "ليرة سورية" : "دولار أمريكي"} (يمكن تغييرها من الإعدادات)
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        emptyState={{
          title: "لا توجد فواتير",
          description: "ابدأ بإنشاء فاتورة جديدة",
          icon: <FileText className="h-8 w-8 text-muted-foreground" />,
          action: (
            <Button onClick={openCreateModal} variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              فاتورة جديدة
            </Button>
          ),
        }}
      />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="إنشاء فاتورة جديدة"
        size="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">الزبون *</Label>
              <select
                id="customer"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">اختر الزبون</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">نوع الفاتورة</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="مفرق">مفرق</option>
                <option value="جملة">جملة</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>المنتجات *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItemRow} className="bg-transparent">
                <Plus className="h-4 w-4 ml-1" />
                إضافة منتج
              </Button>
            </div>

            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={item.product}
                    onChange={(e) => updateItem(index, "product", e.target.value)}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {productTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    placeholder="الكمية"
                    className="w-24"
                  />
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    placeholder="السعر"
                    className="w-28"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paid">المبلغ المدفوع</Label>
              <Input
                id="paid"
                type="number"
                value={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>الإجمالي</Label>
              <div className="h-10 flex items-center px-3 rounded-md bg-muted font-bold">
                {formatCurrency(calculateTotal())}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              إنشاء الفاتورة
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="تفاصيل الفاتورة">
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">رقم الفاتورة</p>
                <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">التاريخ</p>
                <p className="font-semibold">{new Date(selectedInvoice.date).toLocaleDateString("ar-SA")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">الزبون</p>
                <p className="font-semibold">{selectedInvoice.customer}</p>
              </div>
              <div>
                <p className="text-muted-foreground">النوع</p>
                <p className="font-semibold">{selectedInvoice.type}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الإجمالي</span>
                <span className="font-semibold">{formatCurrency(selectedInvoice.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المدفوع</span>
                <span className="font-semibold text-success">{formatCurrency(selectedInvoice.paid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المتبقي</span>
                <span className="font-semibold text-destructive">
                  {formatCurrency(selectedInvoice.total - selectedInvoice.paid)}
                </span>
              </div>
            </div>

            <div className="flex justify-center pt-2">{getStatusBadge(selectedInvoice)}</div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="تسجيل دفعة">
        {selectedInvoice && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>الفاتورة:</span>
                <span className="font-semibold">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>الزبون:</span>
                <span className="font-semibold">{selectedInvoice.customer}</span>
              </div>
              <div className="flex justify-between">
                <span>المتبقي:</span>
                <span className="font-semibold text-destructive">
                  {formatCurrency(selectedInvoice.total - selectedInvoice.paid)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">مبلغ الدفعة *</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
                max={selectedInvoice.total - selectedInvoice.paid}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                تسجيل الدفعة
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  )
}
