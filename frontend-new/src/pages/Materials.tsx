
import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Layers } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { feedsApi } from "@/lib/api"

interface FeedPrice {
    price_type: "retail" | "wholesale"
    currency: string
    price_per_kg: number
}

interface Item {
    id: number
    name: string
    quantity: number
    unit: string

    minStock: number
    prices?: FeedPrice[]
}

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Item[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Item | null>(null)
    const [deletingItem, setDeletingItem] = useState<Item | null>(null)

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        minStock: "",
        unit: "كغ",
        // Prices
        retail_syp: "",
        wholesale_syp: "",
        retail_usd: "",
        wholesale_usd: "",
    })

    const { showToast } = useToast()

    useEffect(() => {
        loadMaterials()
    }, [])

    const loadMaterials = async () => {
        try {
            const feeds = await feedsApi.getFeeds()
            // Fetch prices for each feed
            const feedsWithPrices = await Promise.all(
                feeds.map(async (feed: any) => {
                    const prices = await feedsApi.getFeedPrices(feed.id)
                    return {
                        id: feed.id,
                        name: feed.name,
                        quantity: feed.quantity_kg || 0,
                        unit: "كغ",
                        minStock: 0,
                        prices: prices
                    }
                })
            )
            console.log(feedsWithPrices)
            setMaterials(feedsWithPrices)

        } finally {
            setIsLoading(false)
        }
    }

    const openAddModal = () => {
        setEditingItem(null)
        setFormData({
            name: "",
            minStock: "0",
            unit: "كغ",
            retail_syp: "0",
            wholesale_syp: "0",
            retail_usd: "0",
            wholesale_usd: "0",
        })
        setIsModalOpen(true)
    }

    const openEditModal = (item: Item) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            minStock: item.minStock.toString(),
            unit: item.unit,
            retail_syp: (item.prices?.find(p => p.price_type?.toLowerCase() === 'retail' && p.currency?.toUpperCase() === 'SYP')?.price_per_kg || 0).toString(),
            wholesale_syp: (item.prices?.find(p => p.price_type?.toLowerCase() === 'wholesale' && p.currency?.toUpperCase() === 'SYP')?.price_per_kg || 0).toString(),
            retail_usd: (item.prices?.find(p => p.price_type?.toLowerCase() === 'retail' && p.currency?.toUpperCase() === 'USD')?.price_per_kg || 0).toString(),
            wholesale_usd: (item.prices?.find(p => p.price_type?.toLowerCase() === 'wholesale' && p.currency?.toUpperCase() === 'USD')?.price_per_kg || 0).toString(),
        })
        setIsModalOpen(true)
    }

    const openDeleteDialog = (item: Item) => {
        setDeletingItem(item)
        setIsDeleteDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            showToast("يرجى إدخال اسم المادة", "error")
            return
        }

        try {
            // Prepare prices
            const prices = [
                { price_type: "retail", currency: "SYP", price_per_kg: Number(formData.retail_syp) || 0 },
                { price_type: "wholesale", currency: "SYP", price_per_kg: Number(formData.wholesale_syp) || 0 },
                { price_type: "retail", currency: "USD", price_per_kg: Number(formData.retail_usd) || 0 },
                { price_type: "wholesale", currency: "USD", price_per_kg: Number(formData.wholesale_usd) || 0 },
            ]

            if (editingItem) {
                await feedsApi.updateFeed(editingItem.id, { name: formData.name })
                await feedsApi.updateFeedPrices(editingItem.id, prices)
                showToast("تم تحديث المادة بنجاح", "success")
            } else {
                const newFeed = await feedsApi.addFeed({ name: formData.name, quantity_kg: 0 })
                // Extract ID from response
                const feedId = newFeed.data?.id || newFeed.id
                if (feedId) {
                    await feedsApi.updateFeedPrices(feedId, prices)
                }
                showToast("تم إضافة المادة بنجاح", "success")
            }
            // Reload data
            await loadMaterials()
            setIsModalOpen(false)
        } catch (err: any) {
            console.error('Save error:', err)
            showToast(err.message || "حدث خطأ أثناء حفظ المادة", "error")
        }
    }

    const handleDelete = async () => {
        if (!deletingItem) return
        try {
            await feedsApi.deleteFeed(deletingItem.id)
            setMaterials(prev => prev.filter(m => m.id !== deletingItem.id))
            showToast("تم حذف المادة بنجاح", "success")
        } catch {
            showToast("حدث خطأ أثناء حذف المادة", "error")
        } finally {
            setIsDeleteDialogOpen(false)
            setDeletingItem(null)
        }
    }

    const columns = [
        { key: "name", header: "اسم المادة" },
        {
            key: "prices",
            header: "الأسعار (ل.س)",
            render: (item: Item) => {
                console.log('the item', item);
                const retail = item.prices?.find(p => p.price_type?.toLowerCase() === 'retail' && p.currency?.toUpperCase() === 'SYP')?.price_per_kg || 0
                const wholesale = item.prices?.find(p => p.price_type?.toLowerCase() === 'wholesale' && p.currency?.toUpperCase() === 'SYP')?.price_per_kg || 0
                return (
                    <div className="text-sm">
                        <div>مفرق: {retail.toLocaleString()}</div>
                        <div className="text-muted-foreground">جملة: {wholesale.toLocaleString()}</div>
                    </div>
                )
            }
        },
        {
            key: "actions",
            header: "الإجراءات",
            render: (item: Item) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(item) }}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); openDeleteDialog(item) }}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                </div>
            ),
        },
    ]

    return (
        <DashboardLayout
            title="المواد"
            actions={
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة مادة
                </Button>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">عدد المواد المعرفة</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{materials.length}</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={materials}
                isLoading={isLoading}
                emptyState={{
                    title: "لا توجد مواد",
                    description: "ابدأ بتعريف المواد وأسعارها",
                    icon: <Layers className="h-8 w-8 text-muted-foreground" />,
                    action: (
                        <Button onClick={openAddModal} variant="outline" className="gap-2 bg-transparent">
                            <Plus className="h-4 w-4" />
                            إضافة مادة
                        </Button>
                    )
                }}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "تعديل المادة والأسعار" : "إضافة مادة جديدة"}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">اسم المادة *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="اسم المادة"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minStock">حد تنبيه المخزون</Label>
                            <Input
                                id="minStock"
                                type="number"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <Label className="text-lg">قائمة الأسعار</Label>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>سعر المفرق (SYP)</Label>
                                <Input
                                    type="number"
                                    value={formData.retail_syp}
                                    onChange={(e) => setFormData({ ...formData, retail_syp: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>سعر الجملة (SYP)</Label>
                                <Input
                                    type="number"
                                    value={formData.wholesale_syp}
                                    onChange={(e) => setFormData({ ...formData, wholesale_syp: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>سعر المفرق (USD)</Label>
                                <Input
                                    type="number"
                                    value={formData.retail_usd}
                                    onChange={(e) => setFormData({ ...formData, retail_usd: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>سعر الجملة (USD)</Label>
                                <Input
                                    type="number"
                                    value={formData.wholesale_usd}
                                    onChange={(e) => setFormData({ ...formData, wholesale_usd: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                            حفظ
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            إلغاء
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                title="حذف المادة"
                message={`هل أنت متأكد من حذف "${deletingItem?.name}"؟`}
                confirmText="حذف"
                cancelText="إلغاء"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => {
                    setIsDeleteDialogOpen(false)
                    setDeletingItem(null)
                }}
            />
        </DashboardLayout>
    )
}
