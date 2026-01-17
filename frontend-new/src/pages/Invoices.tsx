
import type React from "react"
import { useState, useEffect } from "react"
import { Plus, FileText, Eye, DollarSign, Search, Edit } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { invoicesApi, customersApi, feedsApi, debtsApi } from "@/lib/api"

interface Invoice {
    id: number
    customer_name: string
    total_amount: number
    currency: string
    is_walk_in: number
    total_paid: number
    created_at: string
}

interface Customer {
    id: number
    name: string
    phone: string
}

interface Feed {
    id: number
    name: string
    quantity_kg: number
    prices: Array<{
        price_type: string
        currency: string
        price_per_kg: number
    }>
}

interface InvoiceItem {
    feedId: string
    feedName: string
    availableQty: number
    quantity: string
    unitPrice: number
}

interface InvoiceDetails {
    id: number
    customer_name?: string
    is_walk_in: number
    total_amount: number
    currency: string
    created_at: string
    lines: Array<{
        feed_name: string
        quantity_kg: number
        unit_price: number
        price_type: string
    }>
    payments: Array<{
        amount: number
        created_at: string
        payment_method: string
    }>
    total_paid: number
    remaining: number
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [feeds, setFeeds] = useState<Feed[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editInvoiceId, setEditInvoiceId] = useState<number | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(null)
    const [paymentAmount, setPaymentAmount] = useState("")

    // Search filters
    const [searchCustomer, setSearchCustomer] = useState("")
    const [searchDateFrom, setSearchDateFrom] = useState("")
    const [searchDateTo, setSearchDateTo] = useState("")

    const [formData, setFormData] = useState({
        isWalkIn: false,
        customerId: "",
        customerSearch: "",
        invoiceType: "retail" as "retail" | "wholesale",
        currency: "SYP" as "SYP" | "USD",
        initialPayment: "",
        items: [
            { feedId: "", feedName: "", availableQty: 0, quantity: "", unitPrice: 0 }
        ] as InvoiceItem[]
    })

    const { showToast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [searchCustomer, searchDateFrom, searchDateTo, invoices])

    const applyFilters = () => {
        let filtered = [...invoices]

        // Filter by customer name
        if (searchCustomer.trim()) {
            filtered = filtered.filter(inv =>
                inv.customer_name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                (inv.is_walk_in && "زبون آخر".includes(searchCustomer.toLowerCase()))
            )
        }

        // Filter by date range
        if (searchDateFrom) {
            const fromDate = new Date(searchDateFrom)
            filtered = filtered.filter(inv => new Date(inv.created_at) >= fromDate)
        }
        if (searchDateTo) {
            const toDate = new Date(searchDateTo)
            toDate.setHours(23, 59, 59)
            filtered = filtered.filter(inv => new Date(inv.created_at) <= toDate)
        }

        setFilteredInvoices(filtered)
    }

    const loadData = async () => {
        try {
            const [invoicesData, customersData, feedsData] = await Promise.all([
                invoicesApi.getInvoices(),
                customersApi.getCustomers(),
                feedsApi.getFeeds(1, 100)
            ])

            setInvoices(invoicesData)
            setFilteredInvoices(invoicesData)

            const mappedCustomers = customersData.map((c: any) => ({
                id: c.id,
                name: c.full_name || c.name || '',
                phone: c.phone_number || c.phone || ''
            }))
            setCustomers(mappedCustomers)

            const feedsWithPrices = await Promise.all(
                feedsData.map(async (feed: any) => {
                    const prices = await feedsApi.getFeedPrices(feed.id)
                    return {
                        id: feed.id,
                        name: feed.name,
                        quantity_kg: feed.quantity_kg || 0,
                        prices: prices || []
                    }
                })
            )
            setFeeds(feedsWithPrices)
        } catch (err: any) {
            console.error('Load data error:', err)
            showToast(err.message || "فشل تحميل البيانات", "error")
        } finally {
            setIsLoading(false)
        }
    }

    const loadInvoiceDetails = async (invoiceId: number) => {
        try {
            const details = await invoicesApi.getInvoiceDetails(invoiceId)
            setSelectedInvoice(details)
            setIsDetailsModalOpen(true)
        } catch (err: any) {
            console.error('Load invoice details error:', err)
            showToast(err.message || "فشل تحميل تفاصيل الفاتورة", "error")
        }
    }

    const openCreateModal = () => {
        setIsEditing(false)
        setEditInvoiceId(null)
        setFormData({
            isWalkIn: false,
            customerId: "",
            customerSearch: "",
            invoiceType: "retail",
            currency: "SYP",
            initialPayment: "",
            items: [{ feedId: "", feedName: "", availableQty: 0, quantity: "", unitPrice: 0 }]
        })
        setIsCreateModalOpen(true)
    }

    const openPaymentModal = (invoice: InvoiceDetails) => {
        setSelectedInvoice(invoice)
        setPaymentAmount("")
        setIsPaymentModalOpen(true)
    }

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { feedId: "", feedName: "", availableQty: 0, quantity: "", unitPrice: 0 }]
        })
    }

    const removeItem = (index: number) => {
        if (formData.items.length === 1) {
            showToast("يجب أن يكون هناك بند واحد على الأقل", "error")
            return
        }
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        })
    }

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...formData.items]
        newItems[index] = { ...newItems[index], [field]: value }

        if (field === "feedId" && value) {
            const feed = feeds.find(f => f.id === Number(value))
            if (feed) {
                const price = feed.prices?.find(
                    p => p.price_type === formData.invoiceType && p.currency === formData.currency
                )
                newItems[index].unitPrice = price?.price_per_kg || 0
                newItems[index].feedName = feed.name
                newItems[index].availableQty = feed.quantity_kg
            }
        }

        setFormData({ ...formData, items: newItems })
    }

    const handleInvoiceTypeChange = (type: "retail" | "wholesale") => {
        const updatedItems = formData.items.map(item => {
            if (item.feedId) {
                const feed = feeds.find(f => f.id === Number(item.feedId))
                if (feed) {
                    const price = feed.prices?.find(
                        p => p.price_type === type && p.currency === formData.currency
                    )
                    return { ...item, unitPrice: price?.price_per_kg || 0 }
                }
            }
            return item
        })
        setFormData({ ...formData, invoiceType: type, items: updatedItems })
    }

    const handleCurrencyChange = (currency: "SYP" | "USD") => {
        const updatedItems = formData.items.map(item => {
            if (item.feedId) {
                const feed = feeds.find(f => f.id === Number(item.feedId))
                if (feed) {
                    const price = feed.prices?.find(
                        p => p.price_type === formData.invoiceType && p.currency === currency
                    )
                    return { ...item, unitPrice: price?.price_per_kg || 0 }
                }
            }
            return item
        })
        setFormData({ ...formData, currency, items: updatedItems })
    }

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            const qty = Number(item.quantity) || 0
            return sum + (qty * item.unitPrice)
        }, 0)
    }

    const validateForm = () => {
        if (!formData.isWalkIn && !formData.customerId) {
            showToast("يرجى اختيار زبون أو تحديد 'زبون آخر'", "error")
            return false
        }

        if (formData.items.length === 0) {
            showToast("يجب إضافة بند واحد على الأقل", "error")
            return false
        }

        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i]

            if (!item.feedId) {
                showToast(`يرجى اختيار مادة للبند ${i + 1}`, "error")
                return false
            }

            const qty = Number(item.quantity)
            if (!qty || qty <= 0) {
                showToast(`يرجى إدخال كمية صحيحة للبند ${i + 1}`, "error")
                return false
            }

            if (qty > item.availableQty) {
                showToast(
                    `الكمية المطلوبة (${qty} كغ) أكبر من المتوفر (${item.availableQty} كغ) - ${item.feedName}`,
                    "error"
                )
                return false
            }

            if (!item.unitPrice || item.unitPrice <= 0) {
                showToast(`سعر غير متوفر للبند ${i + 1}. تأكد من إضافة الأسعار للمادة.`, "error")
                return false
            }
        }

        const total = calculateTotal()
        const payment = Number(formData.initialPayment) || 0

        if (formData.isWalkIn && payment !== total) {
            showToast("زبون آخر يجب أن يدفع كامل المبلغ", "error")
            return false
        }

        if (payment > total) {
            showToast("المبلغ المدفوع أكبر من الإجمالي", "error")
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            const invoiceData = {
                customerId: formData.isWalkIn ? null : Number(formData.customerId),
                isWalkIn: formData.isWalkIn,
                currency: formData.currency,
                initialPayment: Number(formData.initialPayment) || 0,
                items: formData.items.map(item => ({
                    feedId: Number(item.feedId),
                    quantity_kg: Number(item.quantity),
                    price_type: formData.invoiceType,
                    unit_price: item.unitPrice
                }))
            }

            if (isEditing && editInvoiceId) {
                await invoicesApi.updateInvoice(editInvoiceId, invoiceData)
                showToast("تم تحديث الفاتورة بنجاح", "success")
            } else {
                await invoicesApi.createInvoice(invoiceData)
                showToast("تم إنشاء الفاتورة بنجاح", "success")
            }

            setIsCreateModalOpen(false)
            await loadData()
        } catch (err: any) {
            console.error('Submit invoice error:', err)
            showToast(err.message || "حدث خطأ أثناء معالجة الفاتورة", "error")
        }
    }

    const handleEdit = async (id: number) => {
        try {
            const details = await invoicesApi.getInvoiceDetails(id)
            setEditInvoiceId(id)
            setIsEditing(true)
            setFormData({
                customerId: details.customer_id?.toString() || "",
                customerSearch: details.customer_name || "",
                isWalkIn: Boolean(details.is_walk_in),
                invoiceType: details.lines[0]?.price_type || "retail",
                currency: details.currency || "SYP",
                initialPayment: "0", // Initial payment shouldn't be edited easily if payments exist
                items: details.lines.map((l: any) => {
                    const currentFeed = feeds.find(f => f.id === l.feed_id)
                    return {
                        feedId: l.feed_id.toString(),
                        feedName: l.feed_name,
                        quantity: l.quantity_kg.toString(),
                        unitPrice: Number(l.unit_price),
                        availableQty: (currentFeed?.quantity_kg || 0) + l.quantity_kg // Current stock + what's already in the invoice
                    }
                })
            })
            setIsCreateModalOpen(true)
        } catch (err: any) {
            console.error('Load invoice for edit error:', err)
            showToast("فشل تحميل الفاتورة للتعديل", "error")
        }
    }

    const handleRecordPayment = async () => {
        if (!selectedInvoice) return

        const amount = Number(paymentAmount)
        if (!amount || amount <= 0) {
            showToast("يرجى إدخال مبلغ صحيح", "error")
            return
        }

        if (amount > selectedInvoice.remaining) {
            showToast(`المبلغ أكبر من المتبقي (${selectedInvoice.remaining.toLocaleString()})`, "error")
            return
        }

        try {
            await debtsApi.recordPayment({
                invoiceId: selectedInvoice.id,
                amount,
                currency: selectedInvoice.currency
            })
            showToast("تم تسجيل الدفعة بنجاح", "success")
            setIsPaymentModalOpen(false)
            await loadData()
            // Reload invoice details
            await loadInvoiceDetails(selectedInvoice.id)
        } catch (err: any) {
            console.error('Record payment error:', err)
            showToast(err.message || "حدث خطأ أثناء تسجيل الدفعة", "error")
        }
    }

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(formData.customerSearch.toLowerCase())
    )

    const columns = [
        {
            key: "created_at",
            header: "التاريخ",
            render: (item: Invoice) => new Date(item.created_at).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "short",
                day: "numeric"
            })
        },
        {
            key: "customer_name",
            header: "الزبون",
            render: (item: Invoice) => item.is_walk_in ? "زبون آخر" : item.customer_name || "غير محدد"
        },
        {
            key: "total_amount",
            header: "الإجمالي",
            render: (item: Invoice) => (
                <span className="font-bold">
                    {item.total_amount?.toLocaleString() || 0} {item.currency}
                </span>
            )
        },
        {
            key: "status",
            header: "الحالة",
            render: (item: Invoice) => {
                const remaining = (item.total_amount || 0) - (item.total_paid || 0)
                if (item.is_walk_in || remaining === 0) {
                    return <span className="text-success font-medium">مدفوعة</span>
                }
                if (item.total_paid > 0) {
                    return <span className="text-warning font-medium">دين جزئي: {remaining.toLocaleString()}</span>
                }
                return <span className="text-destructive font-medium">غير مدفوعة</span>
            }
        },
        {
            key: "actions",
            header: "الإجراءات",
            render: (item: Invoice) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(item.id)}
                        className="p-2 rounded hover:bg-muted text-primary"
                        title="تعديل الفاتورة"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => loadInvoiceDetails(item.id)}
                        className="p-2 rounded hover:bg-muted"
                        title="عرض التفاصيل"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ]

    const total = calculateTotal()

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
            {/* Search Filters */}
            <div className="mb-6 p-4 bg-card rounded-lg border space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">بحث وتصفية</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="searchCustomer">اسم الزبون</Label>
                        <Input
                            id="searchCustomer"
                            placeholder="ابحث باسم الزبون..."
                            value={searchCustomer}
                            onChange={(e) => setSearchCustomer(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="dateFrom">من تاريخ</Label>
                        <Input
                            id="dateFrom"
                            type="date"
                            value={searchDateFrom}
                            onChange={(e) => setSearchDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="dateTo">إلى تاريخ</Label>
                        <Input
                            id="dateTo"
                            type="date"
                            value={searchDateTo}
                            onChange={(e) => setSearchDateTo(e.target.value)}
                        />
                    </div>
                </div>
                {(searchCustomer || searchDateFrom || searchDateTo) && (
                    <div className="text-sm text-muted-foreground">
                        عرض {filteredInvoices.length} من أصل {invoices.length} فاتورة
                    </div>
                )}
            </div>

            <DataTable
                columns={columns}
                data={filteredInvoices}
                isLoading={isLoading}
                emptyState={{
                    title: "لا توجد فواتير",
                    description: "قم بإنشاء فاتورة جديدة",
                    icon: <FileText className="h-8 w-8 text-muted-foreground" />,
                    action: (
                        <Button onClick={openCreateModal} variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            فاتورة جديدة
                        </Button>
                    )
                }}
            />

            {/* Create Invoice Modal - keeping existing from previous code */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={isEditing ? "تعديل فاتورة" : "إنشاء فاتورة جديدة"}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Type */}
                    <div className="space-y-2">
                        <Label>نوع الزبون</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={!formData.isWalkIn}
                                    onChange={() => setFormData({ ...formData, isWalkIn: false, customerId: "", initialPayment: "" })}
                                    className="w-4 h-4"
                                />
                                <span>زبون مسجل</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.isWalkIn}
                                    onChange={() => {
                                        const total = calculateTotal()
                                        setFormData({ ...formData, isWalkIn: true, customerId: "", initialPayment: total.toString() })
                                    }}
                                    className="w-4 h-4"
                                />
                                <span>زبون آخر (دفع كامل)</span>
                            </label>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    {!formData.isWalkIn && (
                        <div className="space-y-2">
                            <Label htmlFor="customer">الزبون *</Label>
                            <Input
                                id="customer-search"
                                type="text"
                                placeholder="ابحث عن زبون..."
                                value={formData.customerSearch}
                                onChange={(e) => setFormData({ ...formData, customerSearch: e.target.value })}
                                className="mb-2"
                            />
                            <select
                                value={formData.customerId}
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                required={!formData.isWalkIn}
                            >
                                <option value="">اختر زبون</option>
                                {filteredCustomers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.phone ? `- ${c.phone}` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Invoice Type & Currency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="invoiceType">نوع الفاتورة *</Label>
                            <select
                                id="invoiceType"
                                value={formData.invoiceType}
                                onChange={(e) => handleInvoiceTypeChange(e.target.value as "retail" | "wholesale")}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="retail">مفرق</option>
                                <option value="wholesale">جملة</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">العملة *</Label>
                            <select
                                id="currency"
                                value={formData.currency}
                                onChange={(e) => handleCurrencyChange(e.target.value as "SYP" | "USD")}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="SYP">ليرة سورية (SYP)</option>
                                <option value="USD">دولار أمريكي (USD)</option>
                            </select>
                        </div>
                    </div>

                    {/* Items - keeping from previous implementation */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label>بنود الفاتورة</Label>
                            <Button type="button" onClick={addItem} size="sm" variant="outline">
                                <Plus className="h-4 w-4 ml-1" />
                                إضافة بند
                            </Button>
                        </div>

                        {formData.items.map((item, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">البند {index + 1}</span>
                                    {formData.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-destructive hover:text-destructive/80"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <Label>المادة *</Label>
                                        <Input
                                            type="text"
                                            placeholder="ابحث عن مادة..."
                                            value={item.feedName}
                                            onChange={(e) => {
                                                const newItems = [...formData.items]
                                                newItems[index].feedName = e.target.value
                                                setFormData({ ...formData, items: newItems })
                                            }}
                                            className="mb-1"
                                        />
                                        <select
                                            value={item.feedId}
                                            onChange={(e) => updateItem(index, "feedId", e.target.value)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            <option value="">اختر مادة</option>
                                            {feeds
                                                .filter(f =>
                                                    !item.feedName ||
                                                    f.name.toLowerCase().includes(item.feedName.toLowerCase())
                                                )
                                                .map((f) => (
                                                    <option key={f.id} value={f.id}>
                                                        {f.name} (متوفر: {f.quantity_kg} كغ)
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <Label>الكمية (كغ) *</Label>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>سعر الكيلو</Label>
                                        <Input
                                            type="number"
                                            value={item.unitPrice}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>الإجمالي</Label>
                                        <Input
                                            type="text"
                                            value={(Number(item.quantity || 0) * item.unitPrice).toLocaleString()}
                                            readOnly
                                            className="bg-muted font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Payment Section */}
                    <div className="space-y-3">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex justify-between items-center text-lg font-bold mb-3">
                                <span>الإجمالي الكلي:</span>
                                <span>{total.toLocaleString()} {formData.currency}</span>
                            </div>

                            {!formData.isWalkIn && !isEditing && (
                                <div className="space-y-2">
                                    <Label htmlFor="initialPayment">المبلغ المدفوع (اختياري)</Label>
                                    <Input
                                        id="initialPayment"
                                        type="number"
                                        value={formData.initialPayment}
                                        onChange={(e) => setFormData({ ...formData, initialPayment: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                        max={total}
                                    />
                                    {Number(formData.initialPayment) > 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            المتبقي: {(total - Number(formData.initialPayment)).toLocaleString()} {formData.currency}
                                        </p>
                                    )}
                                </div>
                            )}

                            {isEditing && !formData.isWalkIn && (
                                <div className="p-3 bg-muted rounded-md text-sm">
                                    <p>ملاحظة: لتعديل المدفوعات لهذه الفاتورة، يرجى استخدام نافذة "تسجيل دفعة" من قائمة الإجراءات.</p>
                                </div>
                            )}

                            {formData.isWalkIn && (
                                <p className="text-sm text-success font-medium">
                                    ✓ زبون آخر - دفع كامل ({total.toLocaleString()} {formData.currency})
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                            {isEditing ? "تحديث الفاتورة" : "حفظ الفاتورة"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Invoice Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="تفاصيل الفاتورة"
                size="lg"
            >
                {selectedInvoice && (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">الزبون</p>
                                <p className="font-medium">
                                    {selectedInvoice.is_walk_in ? "زبون آخر" : selectedInvoice.customer_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">التاريخ</p>
                                <p className="font-medium">
                                    {new Date(selectedInvoice.created_at).toLocaleDateString("ar-SA")}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">الإجمالي</p>
                                <p className="font-bold text-lg">
                                    {(selectedInvoice.total_amount || 0).toLocaleString()} {selectedInvoice.currency}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">المدفوع</p>
                                <p className="font-bold text-lg text-success">
                                    {(selectedInvoice.total_paid || 0).toLocaleString()} {selectedInvoice.currency}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <h3 className="font-medium mb-3">البنود</h3>
                            <div className="space-y-2">
                                {selectedInvoice.lines?.map((line, idx) => (
                                    <div key={idx} className="p-3 border rounded flex justify-between">
                                        <div>
                                            <p className="font-medium">{line.feed_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {line.quantity_kg} كغ × {(line.unit_price || 0).toLocaleString()} = {((line.quantity_kg || 0) * (line.unit_price || 0)).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{line.price_type === 'retail' ? 'مفرق' : 'جملة'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payments */}
                        {(selectedInvoice.payments?.length || 0) > 0 && (
                            <div>
                                <h3 className="font-medium mb-3">الدفعات</h3>
                                <div className="space-y-2">
                                    {selectedInvoice.payments.map((payment, idx) => (
                                        <div key={idx} className="p-3 border rounded flex justify-between">
                                            <div>
                                                <p className="font-medium">{(payment.amount || 0).toLocaleString()} {selectedInvoice.currency}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(payment.created_at || Date.now()).toLocaleDateString("ar-SA")} - {payment.payment_method}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Remaining */}
                        {(selectedInvoice.remaining || 0) > 0 && !selectedInvoice.is_walk_in && (
                            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium">المتبقي:</span>
                                    <span className="font-bold text-lg text-warning">
                                        {(selectedInvoice.remaining || 0).toLocaleString()} {selectedInvoice.currency}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => openPaymentModal(selectedInvoice)}
                                    className="w-full gap-2"
                                    variant="outline"
                                >
                                    <DollarSign className="h-4 w-4" />
                                    تسجيل دفعة
                                </Button>
                            </div>
                        )}

                        {(selectedInvoice.remaining || 0) === 0 && (
                            <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-center">
                                <p className="font-medium text-success">✓ الفاتورة مدفوعة بالكامل</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="تسجيل دفعة"
                size="sm"
            >
                {selectedInvoice && (
                    <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-muted-foreground">المتبقي:</span>
                                <span className="font-bold">{selectedInvoice.remaining.toLocaleString()} {selectedInvoice.currency}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentAmount">المبلغ المدفوع *</Label>
                            <Input
                                id="paymentAmount"
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0"
                                min="0"
                                max={selectedInvoice.remaining}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={handleRecordPayment} className="flex-1">
                                حفظ
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsPaymentModalOpen(false)}
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    )
}
