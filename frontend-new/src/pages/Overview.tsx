
import { useState, useEffect } from "react"
import { Package, TrendingUp, CreditCard, Receipt } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { SimpleBarChart, SimpleLineChart } from "@/components/dashboard/simple-chart"
import { useSettings } from "@/context/settings-context"
import { dashboardApi } from "@/lib/api"

export default function OverviewPage() {
    const { formatCurrency } = useSettings()
    const [isLoading, setIsLoading] = useState(true)
    const [summary, setSummary] = useState({
        totalInventory: 0,
        totalSales: 0,
        totalDebts: 0,
        totalExpenses: 0,
    })
    const [chartData, setChartData] = useState({
        salesChart: [] as { month: string; value: number }[],
        productionChart: [] as { month: string; value: number }[],
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const [summaryData, charts] = await Promise.all([dashboardApi.getSummary(), dashboardApi.getChartData()])
                setSummary(summaryData)
                setChartData(charts)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    return (
        <DashboardLayout title="لوحة التحكم">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                    title="إجمالي المخزون"
                    value={`${summary.totalInventory.toLocaleString()} كغ`}
                    icon={<Package className="h-6 w-6" />}
                    trend={{ value: 12, isPositive: true }}
                    isLoading={isLoading}
                    colorClass="bg-primary/10 text-primary"
                />
                <SummaryCard
                    title="إجمالي المبيعات"
                    value={formatCurrency(summary.totalSales)}
                    icon={<TrendingUp className="h-6 w-6" />}
                    trend={{ value: 8, isPositive: true }}
                    isLoading={isLoading}
                    colorClass="bg-success/10 text-success"
                />
                <SummaryCard
                    title="إجمالي الديون"
                    value={formatCurrency(summary.totalDebts)}
                    icon={<CreditCard className="h-6 w-6" />}
                    trend={{ value: 5, isPositive: false }}
                    isLoading={isLoading}
                    colorClass="bg-warning/10 text-warning"
                />
                <SummaryCard
                    title="إجمالي المصاريف"
                    value={formatCurrency(summary.totalExpenses)}
                    icon={<Receipt className="h-6 w-6" />}
                    trend={{ value: 3, isPositive: false }}
                    isLoading={isLoading}
                    colorClass="bg-destructive/10 text-destructive"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SimpleBarChart data={chartData.salesChart} title="المبيعات الشهرية" color="bg-primary" isLoading={isLoading} />
                <SimpleLineChart
                    data={chartData.productionChart}
                    title="الإنتاج الشهري"
                    color="text-accent"
                    isLoading={isLoading}
                />
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-card p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground mb-4">أحدث العمليات</h3>
                    <div className="space-y-3">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full skeleton" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-3 w-24 skeleton rounded" />
                                        <div className="h-2 w-16 skeleton rounded" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                                        <TrendingUp className="h-4 w-4 text-success" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">فاتورة جديدة</p>
                                        <p className="text-xs text-muted-foreground">منذ 5 دقائق</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">إنتاج علف دواجن</p>
                                        <p className="text-xs text-muted-foreground">منذ ساعة</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 text-warning" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">دفعة مستلمة</p>
                                        <p className="text-xs text-muted-foreground">منذ ساعتين</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="rounded-xl bg-card p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground mb-4">تنبيهات المخزون</h3>
                    <div className="space-y-3">
                        {isLoading ? (
                            Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-12 skeleton rounded" />)
                        ) : (
                            <>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                                    <span className="text-sm font-medium text-foreground">نخالة قمح</span>
                                    <span className="text-xs text-warning font-semibold">مخزون منخفض</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <span className="text-sm font-medium text-foreground">ذرة صفراء</span>
                                    <span className="text-xs text-muted-foreground">مخزون جيد</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="rounded-xl bg-card p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground mb-4">أكبر المدينين</h3>
                    <div className="space-y-3">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="h-3 w-20 skeleton rounded" />
                                    <div className="h-3 w-16 skeleton rounded" />
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground">خالد سعيد</span>
                                    <span className="font-semibold text-destructive">{formatCurrency(130000)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground">سامي محمود</span>
                                    <span className="font-semibold text-destructive">{formatCurrency(75000)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground">عمر يوسف</span>
                                    <span className="font-semibold text-destructive">{formatCurrency(35000)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
