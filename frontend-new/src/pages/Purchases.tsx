
import type React from "react"
import { useState, useEffect } from "react"
import { Plus, ShoppingCart, Calendar } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { useSettings } from "@/context/settings-context"
import { purchasesApi, inventoryApi } from "@/lib/api"

interface PurchaseOperation {
    id: number
    feed_id: number
    feed_name: string
    quantity_kg: number
    price_per_kg: number
    currency: string
    created_at: string
}

interface InventoryMaterial {
    id: number
    name: string
    quantity: number
    unit: string
}

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<PurchaseOperation[]>([])
    const [materials, setMaterials] = useState<InventoryMaterial[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        feed_id: "",
        quantity: "",
        price: "",
        currency: "SYP",
    })

    const { showToast } = useToast()
    const { formatCurrency } = useSettings()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [purchasesData, matsData] = await Promise.all([
                purchasesApi.getPurchases(),
                inventoryApi.getMaterials(),
            ])
            setPurchases(purchasesData)
            setMaterials(matsData)
        } finally {
            setIsLoading(false)
        }
    }

    const openAddModal = () => {
        setFormData({
            feed_id: "",
            quantity: "",
            price: "",
            currency: "SYP",
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.feed_id || !formData.quantity || !formData.price || !formData.currency) {
            showToast("يرجى ملء جميع الحقول المطلوبة", "error")
            return
        }

        try {
            const selectedMaterial = materials.find((m) => m.id === Number(formData.feed_id))
            const purchaseData = {
                feedId: Number(formData.feed_id),
                quantity_kg: Number(formData.quantity),
                price_per_kg: Number(formData.price),
                currency: formData.currency,
            }

            await purchasesApi.addPurchase(purchaseData)

            // Reload data to get updated inventory
            await loadData()
            showToast("تم تسجيل فاتورة الشراء بنجاح وتحديث المخزون", "success")
            setIsModalOpen(false)
        } catch (err: any) {
            console.error('Purchase error:', err)
            showToast(err.message || "حدث خطأ أثناء تسجيل الفاتورة", "error")
        }
    }

    const columns = [
        {
            key: "created_at",
            header: "التاريخ",
            render: (item: PurchaseOperation) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span dir="ltr">
                        {new Date(item.created_at).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            ),
        },
        { key: "feed_name", header: "المادة" },
        {
            key: "quantity_kg",
            header: "الكمية (كغ)",
            render: (item: PurchaseOperation) => item.quantity_kg.toLocaleString(),
        },
        {
            key: "price_per_kg",
            header: "السعر الإفرادي",
            render: (item: PurchaseOperation) => `${item.price_per_kg.toLocaleString()} ${item.currency}`,
        },
        {
            key: "total_cost",
            header: "الإجمالي",
            render: (item: PurchaseOperation) => (
                <span className="font-bold">
                    {(item.quantity_kg * item.price_per_kg).toLocaleString()} {item.currency}
                </span>
            ),
        },
    ]

    // Calculate totals
    const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity_kg, 0)
    const totalCost = purchases.reduce((sum, p) => sum + p.quantity_kg * p.price_per_kg, 0)

    return (
        <DashboardLayout
            title="المشتريات"
            actions={
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    فاتورة شراء جديدة
                </Button>
            }
        >
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">عدد الفواتير</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{purchases.length}</p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">إجمالي الكميات المشتراة</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{totalQuantity.toLocaleString()} كغ</p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">إجمالي التكلفة التقديرية (SYP)</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalCost)}</p>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={purchases}
                isLoading={isLoading}
                emptyState={{
                    title: "لا توجد مشتريات",
                    description: "قم بإضافة فواتير شراء للمواد الأولية",
                    icon: <ShoppingCart className="h-8 w-8 text-muted-foreground" />,
                    action: (
                        <Button onClick={openAddModal} variant="outline" className="gap-2 bg-transparent">
                            <Plus className="h-4 w-4" />
                            فاتورة شراء جديدة
                        </Button>
                    ),
                }}
            />

            {/* Add Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة فاتورة شراء" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="feed_id">المادة *</Label>
                            <select
                                id="feed_id"
                                value={formData.feed_id}
                                onChange={(e) => setFormData({ ...formData, feed_id: e.target.value })}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="">اختر المادة</option>
                                {materials.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} (المتوفر: {m.quantity} {m.unit})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">الكمية (كغ) *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">سعر الكيلو *</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">العملة *</Label>
                            <select
                                id="currency"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="SYP">ليرة سورية (SYP)</option>
                                <option value="USD">دولار أمريكي (USD)</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium">الإجمالي المقدر:</span>
                        <span className="text-lg font-bold">
                            {(Number(formData.quantity || 0) * Number(formData.price || 0)).toLocaleString()} {formData.currency}
                        </span>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                            حفظ الفاتورة
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
