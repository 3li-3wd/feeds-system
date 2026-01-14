"use client"

import { useState, useEffect } from "react"
import { BarChart3, Package, CreditCard, TrendingUp, Calendar, Download, FileText } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/context/settings-context"
import { reportsApi } from "@/lib/api"

interface SalesReport {
  totalSales: number
  invoiceCount: number
  topProducts: { name: string; sales: number }[]
}

interface InventoryReport {
  totalValue: number
  lowStockItems: number
  categories: { name: string; count: number; value: number }[]
}

interface DebtsReport {
  totalDebts: number
  customersWithDebts: number
  overdueDebts: number
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<"sales" | "inventory" | "debts">("sales")
  const [isLoading, setIsLoading] = useState(true)
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null)
  const [debtsReport, setDebtsReport] = useState<DebtsReport | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })

  const { formatCurrency } = useSettings()

  useEffect(() => {
    loadReports()
  }, [dateRange])

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const [sales, inventory, debts] = await Promise.all([
        reportsApi.getSalesReport(dateRange.start, dateRange.end),
        reportsApi.getInventoryReport(),
        reportsApi.getDebtsReport(),
      ])
      setSalesReport(sales)
      setInventoryReport(inventory)
      setDebtsReport(debts)
    } finally {
      setIsLoading(false)
    }
  }

  const reportTabs = [
    { id: "sales" as const, label: "تقرير المبيعات", icon: TrendingUp },
    { id: "inventory" as const, label: "تقرير المخزون", icon: Package },
    { id: "debts" as const, label: "تقرير الديون", icon: CreditCard },
  ]

  return (
    <DashboardLayout
      title="التقارير"
      actions={
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          تصدير
        </Button>
      }
    >
      {/* Date Range */}
      <div className="rounded-xl bg-card p-4 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">الفترة:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
            <span className="text-muted-foreground">إلى</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeReport === tab.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Content */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 skeleton rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 skeleton rounded-xl" />
            <div className="h-24 skeleton rounded-xl" />
            <div className="h-24 skeleton rounded-xl" />
          </div>
          <div className="h-64 skeleton rounded-xl" />
        </div>
      ) : (
        <>
          {/* Sales Report */}
          {activeReport === "sales" && salesReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-success/10 p-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(salesReport.totalSales)}</p>
                </div>
                <div className="rounded-xl bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">عدد الفواتير</p>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{salesReport.invoiceCount}</p>
                </div>
              </div>

              <div className="rounded-xl bg-card p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">أكثر المنتجات مبيعاً</h3>
                <div className="space-y-3">
                  {salesReport.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-foreground">{product.name}</span>
                          <span className="text-sm font-semibold">{formatCurrency(product.sales)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(product.sales / salesReport.totalSales) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Inventory Report */}
          {activeReport === "inventory" && inventoryReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(inventoryReport.totalValue)}</p>
                </div>
                <div className="rounded-xl bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-warning/10 p-2">
                      <BarChart3 className="h-5 w-5 text-warning" />
                    </div>
                    <p className="text-sm text-muted-foreground">مواد منخفضة المخزون</p>
                  </div>
                  <p className="text-3xl font-bold text-warning">{inventoryReport.lowStockItems}</p>
                </div>
              </div>

              <div className="rounded-xl bg-card p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">توزيع المخزون حسب الفئة</h3>
                <div className="space-y-4">
                  {inventoryReport.categories.map((category, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-foreground">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{category.count} عنصر</span>
                      </div>
                      <p className="text-lg font-bold text-primary">{formatCurrency(category.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Debts Report */}
          {activeReport === "debts" && debtsReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-destructive/10 p-2">
                      <CreditCard className="h-5 w-5 text-destructive" />
                    </div>
                    <p className="text-sm text-muted-foreground">إجمالي الديون</p>
                  </div>
                  <p className="text-3xl font-bold text-destructive">{formatCurrency(debtsReport.totalDebts)}</p>
                </div>
                <div className="rounded-xl bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">زبائن مدينون</p>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{debtsReport.customersWithDebts}</p>
                </div>
                <div className="rounded-xl bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-warning/10 p-2">
                      <CreditCard className="h-5 w-5 text-warning" />
                    </div>
                    <p className="text-sm text-muted-foreground">ديون متأخرة</p>
                  </div>
                  <p className="text-3xl font-bold text-warning">{formatCurrency(debtsReport.overdueDebts)}</p>
                </div>
              </div>

              <div className="rounded-xl bg-card p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">ملخص حالة الديون</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div>
                      <p className="font-medium text-foreground">ديون نشطة</p>
                      <p className="text-sm text-muted-foreground">تحتاج إلى متابعة</p>
                    </div>
                    <p className="text-xl font-bold text-destructive">{formatCurrency(debtsReport.totalDebts)}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20">
                    <div>
                      <p className="font-medium text-foreground">ديون متأخرة</p>
                      <p className="text-sm text-muted-foreground">تجاوزت فترة السداد</p>
                    </div>
                    <p className="text-xl font-bold text-warning">{formatCurrency(debtsReport.overdueDebts)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Ready for Backend Notice */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          التقارير جاهزة للربط مع قاعدة البيانات. البيانات المعروضة حالياً هي بيانات تجريبية.
        </p>
      </div>
    </DashboardLayout>
  )
}
