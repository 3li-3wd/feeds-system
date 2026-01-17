
import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Car, Users, Receipt, Calendar, Trash2, Edit } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { useSettings } from "@/context/settings-context"
import { expensesApi } from "@/lib/api"

type ExpenseType = "vehicle" | "worker"

interface Expense {
    id: number
    date: string
    description: string
    amount: number
}

export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<ExpenseType>("vehicle")
    const [vehicleExpenses, setVehicleExpenses] = useState<Expense[]>([])
    const [workerExpenses, setWorkerExpenses] = useState<Expense[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editExpenseId, setEditExpenseId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
    })

    const { showToast } = useToast()
    const { formatCurrency } = useSettings()

    useEffect(() => {
        loadExpenses()
    }, [])

    const loadExpenses = async () => {
        try {
            const [vehicleData, workerData] = await Promise.all([
                expensesApi.getVehicleExpenses(),
                expensesApi.getWorkerExpenses(),
            ])
            setVehicleExpenses(vehicleData)
            setWorkerExpenses(workerData)
        } finally {
            setIsLoading(false)
        }
    }

    const openAddModal = () => {
        setIsEditing(false)
        setEditExpenseId(null)
        setFormData({
            date: new Date().toISOString().split("T")[0],
            description: "",
            amount: "",
        })
        setIsModalOpen(true)
    }

    const handleEdit = (expense: Expense) => {
        setIsEditing(true)
        setEditExpenseId(expense.id)
        setFormData({
            date: expense.date.split("T")[0],
            description: expense.description,
            amount: expense.amount.toString(),
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.description.trim() || !formData.amount) {
            showToast("يرجى ملء جميع الحقول المطلوبة", "error")
            return
        }

        try {
            const expenseData = {
                type: activeTab,
                date: formData.date,
                description: formData.description,
                amount: Number(formData.amount),
            }

            if (isEditing && editExpenseId) {
                const updatedExpense = await expensesApi.updateExpense(editExpenseId, expenseData)
                if (activeTab === "vehicle") {
                    setVehicleExpenses((prev) => prev.map(e => e.id === editExpenseId ? updatedExpense : e))
                } else {
                    setWorkerExpenses((prev) => prev.map(e => e.id === editExpenseId ? updatedExpense : e))
                }
                showToast("تم تحديث المصروف بنجاح", "success")
            } else {
                const newExpense = await expensesApi.addExpense(expenseData)
                if (activeTab === "vehicle") {
                    setVehicleExpenses((prev) => [newExpense, ...prev])
                } else {
                    setWorkerExpenses((prev) => [newExpense, ...prev])
                }
                showToast("تم إضافة المصروف بنجاح", "success")
            }

            setIsModalOpen(false)
        } catch {
            showToast(isEditing ? "حدث خطأ أثناء تحديث المصروف" : "حدث خطأ أثناء إضافة المصروف", "error")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return

        try {
            await expensesApi.deleteExpense(id)
            if (activeTab === "vehicle") {
                setVehicleExpenses((prev) => prev.filter((e) => e.id !== id))
            } else {
                setWorkerExpenses((prev) => prev.filter((e) => e.id !== id))
            }
            showToast("تم حذف المصروف بنجاح", "success")
        } catch {
            showToast("حدث خطأ أثناء حذف المصروف", "error")
        }
    }

    const currentExpenses = activeTab === "vehicle" ? vehicleExpenses : workerExpenses
    const totalExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0)
    const allExpenses = [...vehicleExpenses, ...workerExpenses]
    const grandTotal = allExpenses.reduce((sum, e) => sum + e.amount, 0)

    const columns = [
        {
            key: "date",
            header: "التاريخ",
            render: (item: Expense) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(item.date).toLocaleDateString("ar-SA")}
                </div>
            ),
        },
        {
            key: "description",
            header: "الوصف",
            render: (item: Expense) => <span className="font-medium text-foreground">{item.description}</span>,
        },
        {
            key: "amount",
            header: "المبلغ",
            render: (item: Expense) => <span className="font-bold text-destructive">{formatCurrency(item.amount)}</span>,
        },
        {
            key: "actions",
            header: "الإجراءات",
            render: (item: Expense) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ]

    const tabs = [
        { id: "vehicle" as ExpenseType, label: "مصاريف السيارات", icon: Car },
        { id: "worker" as ExpenseType, label: "مصاريف العمال", icon: Users },
    ]

    return (
        <DashboardLayout
            title="المصاريف"
            actions={
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة مصروف
                </Button>
            }
        >
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">إجمالي المصاريف</p>
                    <p className="text-2xl font-bold text-destructive mt-1">{formatCurrency(grandTotal)}</p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">مصاريف السيارات</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                        {formatCurrency(vehicleExpenses.reduce((sum, e) => sum + e.amount, 0))}
                    </p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">مصاريف العمال</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                        {formatCurrency(workerExpenses.reduce((sum, e) => sum + e.amount, 0))}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Current Tab Total */}
            <div className="mb-4 p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    إجمالي {activeTab === "vehicle" ? "مصاريف السيارات" : "مصاريف العمال"}
                </span>
                <span className="font-bold text-foreground">{formatCurrency(totalExpenses)}</span>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={currentExpenses}
                isLoading={isLoading}
                emptyState={{
                    title: "لا توجد مصاريف",
                    description: `لم يتم تسجيل ${activeTab === "vehicle" ? "مصاريف سيارات" : "مصاريف عمال"} بعد`,
                    icon: <Receipt className="h-8 w-8 text-muted-foreground" />,
                    action: (
                        <Button onClick={openAddModal} variant="outline" className="gap-2 bg-transparent">
                            <Plus className="h-4 w-4" />
                            إضافة مصروف
                        </Button>
                    ),
                }}
            />

            {/* Add Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? `تعديل ${activeTab === "vehicle" ? "مصروف سيارة" : "مصروف عمال"}` : `إضافة ${activeTab === "vehicle" ? "مصروف سيارة" : "مصروف عمال"}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">التاريخ *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">الوصف *</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={activeTab === "vehicle" ? "مثال: وقود، صيانة، إطارات" : "مثال: رواتب، مكافآت، تأمينات"}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">المبلغ *</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                            {isEditing ? "تحديث المصروف" : "إضافة المصروف"}
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
