
// Real API service connecting to backend

const API_BASE_URL = "http://localhost:3000/api"

// Helper for fetching
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token")
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
}

// Auth API
export const authApi = {
    login: async (username: string, password: string) => {
        const response = await fetchApi<any>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        })
        // Backend returns: {success: true, data: {id, username, token}}
        // Frontend expects: {token, user: {name, role}}
        return {
            token: response.data.token,
            user: {
                name: response.data.username,
                role: "admin" // Default role, adjust if backend provides it
            }
        }
    },
    logout: async () => {
        return { success: true } // Stateless JWT, just clear client side
    },
    verifyToken: async (_token: string) => {
        // Implement real verification endpoint if needed
        return { valid: true }
    },
}

// Dashboard API
export const dashboardApi = {
    getSummary: async () => {
        return fetchApi<any>("/dashboard/summary")
    },
    getChartData: async () => {
        return fetchApi<any>("/dashboard/charts")
    },
}

// Feeds API (Materials/Inventory)
export const feedsApi = {
    getFeeds: async (page = 1, limit = 20) => {
        const response = await fetchApi<any>(`/feeds?page=${page}&limit=${limit}`)
        // Backend returns: {success, data: {feeds, pagination}}
        return response.data.feeds || []
    },
    addFeed: async (feed: { name: string; quantity_kg: number }) => {
        const response = await fetchApi<any>("/feeds", {
            method: "POST",
            body: JSON.stringify({ name: feed.name, quantity_kg: feed.quantity_kg })
        })
        return response
    },
    updateFeed: async (
        id: number,
        feed: Partial<{ name: string }>,
    ) => {
        // Rename endpoint from Postman: PUT /api/feeds/:id/rename
        const response = await fetchApi<any>(`/feeds/${id}/rename`, {
            method: "PUT",
            body: JSON.stringify({ name: feed.name })
        })
        return response
    },
    deleteFeed: async (id: number) => {
        // Soft delete from Postman: DELETE /api/feeds/:id
        const response = await fetchApi<any>(`/feeds/${id}`, {
            method: "DELETE"
        })
        return response
    },
    getFeedPrices: async (feedId: number) => {
        const response = await fetchApi<any>(`/feeds/${feedId}/prices`)
        return response.data || []
    },
    updateFeedPrices: async (feedId: number, prices: any[]) => {
        const response = await fetchApi<any>(`/feeds/${feedId}/prices`, {
            method: "PUT",
            body: JSON.stringify({ prices })
        })
        return response
    },
}

// Retain inventoryApi alias for backward compatibility for now
export const inventoryApi = {
    getMaterials: feedsApi.getFeeds,
}

// Purchases API
export const purchasesApi = {
    getPurchases: async (page = 1, limit = 20) => {
        const response = await fetchApi<any>(`/purchases?page=${page}&limit=${limit}`)
        return response.data.purchases || []
    },
    addPurchase: async (purchase: {
        feedId: number
        quantity_kg: number
        price_per_kg: number
        currency: string
    }) => {
        const response = await fetchApi<any>("/purchases", {
            method: "POST",
            body: JSON.stringify(purchase),
        })
        return response.data
    },
    getStats: async () => {
        const response = await fetchApi<any>("/purchases/stats")
        return response.data || { total_purchases: 0, total_quantity: 0, total_spent: 0 }
    },
}

// Invoices API
export const invoicesApi = {
    getInvoices: async (page = 1) => {
        const response = await fetchApi<any>(`/invoices?page=${page}`)
        // Backend returns: {success, data: {invoices, pagination}}
        return response.data.invoices || []
    },
    createInvoice: async (invoice: {
        customerId: number | null
        isWalkIn: boolean
        currency: string
        initialPayment?: number
        items: Array<{
            feedId: number
            quantity_kg: number
            price_type: string
            unit_price: number
        }>
    }) => {
        const response = await fetchApi<any>("/invoices", {
            method: "POST",
            body: JSON.stringify(invoice)
        })
        return response.data
    },
    getInvoiceDetails: async (id: number) => {
        const response = await fetchApi<any>(`/invoices/${id}`)
        return response.data
    },
    updateInvoice: async (id: number, data: any) => {
        const response = await fetchApi<any>(`/invoices/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
        return response.data
    },
    recordPayment: async (invoiceId: number, amount: number) => {
        return { success: true, invoiceId, amount }
    },
}

// Debts & Customers match existing mock structure but fetch from backend
export const customersApi = {
    getCustomers: async () => {
        const response = await fetchApi<any>("/customers")
        // Backend returns: {success, data: {customers, pagination}}
        return response.data.customers || []
    },
    addCustomer: async (customer: { full_name: string; phone: string }) => {
        const response = await fetchApi<any>("/customers", {
            method: "POST",
            body: JSON.stringify(customer)
        })
        return response.data
    },
    updateCustomer: async (id: number, customer: Partial<{ name: string; phone: string }>) => {
        const response = await fetchApi<any>(`/customers/${id}`, {
            method: "PUT",
            body: JSON.stringify(customer)
        })
        return response.data
    },
    deleteCustomer: async (id: number) => {
        const response = await fetchApi<any>(`/customers/${id}`, { method: "DELETE" })
        return response.data
    },
}

export const debtsApi = {
    getDebts: async () => {
        const response = await fetchApi<any>("/debts")
        return response.data || []
    },
    getDebtDetails: async (customerId: number) => {
        const response = await fetchApi<any>(`/customers/${customerId}/debt`)
        return response.data
    },
    recordPayment: async (params: {
        invoiceId?: number,
        customerId?: number,
        amount: number,
        currency?: string,
        paymentMethod?: string,
        notes?: string
    }) => {
        const response = await fetchApi<any>("/payments", {
            method: "POST",
            body: JSON.stringify(params),
        })
        return response.data
    },
}

export const expensesApi = {
    getVehicleExpenses: async () => {
        const response = await fetchApi<any>("/expenses?type=vehicle")
        return response.data.expenses || []
    },
    getWorkerExpenses: async () => {
        const response = await fetchApi<any>("/expenses?type=worker")
        return response.data.expenses || []
    },
    addExpense: async (expense: any) => {
        const response = await fetchApi<any>("/expenses", {
            method: "POST",
            body: JSON.stringify(expense),
        })
        return response.data
    },
    updateExpense: async (id: number, expense: any) => {
        const response = await fetchApi<any>(`/expenses/${id}`, {
            method: "PUT",
            body: JSON.stringify(expense),
        })
        return response.data
    },
    deleteExpense: async (id: number) => {
        const response = await fetchApi<any>(`/expenses/${id}`, { method: "DELETE" })
        return response.data
    },
}

export const settingsApi = {
    getSettings: async () => ({
        factoryName: "معمل الأمل للأعلاف",
        phone: "0911234567",
        currency: "SYP",
        exchangeRate: 15000,
        minStockAlert: 500,
    }),
    updateSettings: async (settings: any) => ({ success: true, ...settings })
}

export const reportsApi = {
    getSalesReport: async (startDate: string, endDate: string) => {
        const response = await fetchApi<any>(`/reports/sales?start=${startDate}&end=${endDate}`)
        return response.data
    },
    getInventoryReport: async () => {
        const response = await fetchApi<any>("/reports/inventory")
        return response.data
    },
    getDebtsReport: async () => {
        const response = await fetchApi<any>("/reports/debts")
        return response.data
    },
}

export const adminApi = {
    backup: async () => {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_BASE_URL}/admin/backup`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (!response.ok) throw new Error("فشل إنشاء النسخة الاحتياطية")
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup_${new Date().toISOString().split('T')[0]}.sqlite`
        document.body.appendChild(a)
        a.click()
        a.remove()
    },
    restore: async (file: File) => {
        const token = localStorage.getItem("token")
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch(`${API_BASE_URL}/admin/restore`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.error || "فشل استعادة النسخة الاحتياطية")
        }
        return response.json()
    }
}
