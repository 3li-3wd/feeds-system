"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CreditCard, Phone, FileText, Eye, DollarSign, AlertCircle } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { useSettings } from "@/context/settings-context"
import { debtsApi } from "@/lib/api"

interface Debt {
  id: number
  customerName: string
  phone: string
  remainingAmount: number
  unpaidInvoices: number
}

interface DebtDetails {
  customer: { id: number; name: string; phone: string }
  invoices: { id: number; invoiceNumber: string; date: string; total: number; paid: number; remaining: number }[]
  payments: { id: number; date: string; amount: number }[]
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [debtDetails, setDebtDetails] = useState<DebtDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")

  const { showToast } = useToast()
  const { formatCurrency } = useSettings()

  useEffect(() => {
    loadDebts()
  }, [])

  const loadDebts = async () => {
    try {
      const data = await debtsApi.getDebts()
      setDebts(data)
    } finally {
      setIsLoading(false)
    }
  }

  const openDetailsModal = async (debt: Debt) => {
    setSelectedDebt(debt)
    setIsDetailsModalOpen(true)
    setIsLoadingDetails(true)

    try {
      const details = await debtsApi.getDebtDetails(debt.id)
      setDebtDetails(details)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const openPaymentModal = (debt: Debt) => {
    setSelectedDebt(debt)
    setPaymentAmount("")
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDebt || !paymentAmount) {
      showToast("يرجى إدخال مبلغ الدفعة", "error")
      return
    }

    const amount = Number(paymentAmount)
    if (amount <= 0) {
      showToast("يرجى إدخال مبلغ صحيح", "error")
      return
    }

    if (amount > selectedDebt.remainingAmount) {
      showToast("المبلغ أكبر من المتبقي", "error")
      return
    }

    try {
      await debtsApi.recordPayment(selectedDebt.id, amount)
      setDebts((prev) =>
        prev.map((d) =>
          d.id === selectedDebt.id
            ? {
                ...d,
                remainingAmount: d.remainingAmount - amount,
                unpaidInvoices: d.remainingAmount - amount <= 0 ? 0 : d.unpaidInvoices,
              }
            : d,
        ),
      )
      showToast("تم تسجيل الدفعة بنجاح", "success")
      setIsPaymentModalOpen(false)
    } catch {
      showToast("حدث خطأ أثناء تسجيل الدفعة", "error")
    }
  }

  const columns = [
    {
      key: "customerName",
      header: "اسم الزبون",
      render: (item: Debt) => <span className="font-semibold text-foreground">{item.customerName}</span>,
    },
    {
      key: "phone",
      header: "رقم الهاتف",
      render: (item: Debt) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span dir="ltr">{item.phone}</span>
        </div>
      ),
    },
    {
      key: "remainingAmount",
      header: "المبلغ المتبقي",
      render: (item: Debt) => (
        <span className={`font-bold ${item.remainingAmount > 0 ? "text-destructive" : "text-success"}`}>
          {formatCurrency(item.remainingAmount)}
        </span>
      ),
    },
    {
      key: "unpaidInvoices",
      header: "فواتير غير مدفوعة",
      render: (item: Debt) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{item.unpaidInvoices}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (item: Debt) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              openPaymentModal(item)
            }}
            className="gap-1 h-8 bg-transparent"
          >
            <DollarSign className="h-3 w-3" />
            تسجيل دفعة
          </Button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              openDetailsModal(item)
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ]

  // Calculate totals
  const totalDebts = debts.reduce((sum, d) => sum + d.remainingAmount, 0)
  const customersWithDebts = debts.filter((d) => d.remainingAmount > 0).length
  const totalUnpaidInvoices = debts.reduce((sum, d) => sum + d.unpaidInvoices, 0)

  return (
    <DashboardLayout title="الديون">
      {/* Important Notice */}
      <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground">صفحة إدارة الديون المركزية</h3>
          <p className="text-sm text-muted-foreground mt-1">
            هذه الصفحة تعرض جميع ديون الزبائن. يمكنك تسجيل دفعات جديدة وعرض تفاصيل كل زبون.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">إجمالي الديون</p>
          <p className="text-2xl font-bold text-destructive mt-1">{formatCurrency(totalDebts)}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">زبائن مدينون</p>
          <p className="text-2xl font-bold text-foreground mt-1">{customersWithDebts}</p>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">فواتير غير مدفوعة</p>
          <p className="text-2xl font-bold text-warning mt-1">{totalUnpaidInvoices}</p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={debts}
        isLoading={isLoading}
        emptyState={{
          title: "لا توجد ديون",
          description: "لا يوجد زبائن مدينون حالياً",
          icon: <CreditCard className="h-8 w-8 text-muted-foreground" />,
        }}
      />

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`تفاصيل ديون: ${selectedDebt?.customerName}`}
        size="lg"
      >
        {isLoadingDetails ? (
          <div className="space-y-4">
            <div className="h-20 skeleton rounded" />
            <div className="h-32 skeleton rounded" />
            <div className="h-24 skeleton rounded" />
          </div>
        ) : debtDetails ? (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-foreground mb-2">معلومات الزبون</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">الاسم: </span>
                  <span className="font-medium">{debtDetails.customer.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الهاتف: </span>
                  <span className="font-medium" dir="ltr">
                    {debtDetails.customer.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoices */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">الفواتير</h4>
              <div className="space-y-2">
                {debtDetails.invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                    <div>
                      <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(inv.date).toLocaleDateString("ar-SA")}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm">
                        الإجمالي: <span className="font-medium">{formatCurrency(inv.total)}</span>
                      </p>
                      <p className="text-xs text-destructive">المتبقي: {formatCurrency(inv.remaining)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments History */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">سجل الدفعات</h4>
              {debtDetails.payments.length > 0 ? (
                <div className="space-y-2">
                  {debtDetails.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-success/5">
                      <span className="text-sm">{new Date(payment.date).toLocaleDateString("ar-SA")}</span>
                      <span className="font-semibold text-success">{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد دفعات مسجلة</p>
              )}
            </div>

            {/* Total */}
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center justify-between">
                <span className="font-semibold">إجمالي المتبقي</span>
                <span className="text-xl font-bold text-destructive">
                  {formatCurrency(selectedDebt?.remainingAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="تسجيل دفعة جديدة">
        {selectedDebt && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>الزبون:</span>
                <span className="font-semibold">{selectedDebt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>المبلغ المتبقي:</span>
                <span className="font-semibold text-destructive">{formatCurrency(selectedDebt.remainingAmount)}</span>
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
                max={selectedDebt.remainingAmount}
              />
              <p className="text-xs text-muted-foreground">
                الحد الأقصى: {formatCurrency(selectedDebt.remainingAmount)}
              </p>
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
