// Mock API service for backend integration readiness
// All functions are designed to be easily replaced with real API calls

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    await delay(800)
    if (username === "admin" && password === "admin123") {
      const token = "mock-jwt-token-" + Date.now()
      return { success: true, token, user: { name: "مدير النظام", role: "admin" } }
    }
    throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة")
  },
  logout: async () => {
    await delay(300)
    return { success: true }
  },
  verifyToken: async (token: string) => {
    await delay(200)
    return { valid: token.startsWith("mock-jwt-token-") }
  },
}

// Dashboard API
export const dashboardApi = {
  getSummary: async () => {
    await delay(500)
    return {
      totalInventory: 15420,
      totalSales: 2450000,
      totalDebts: 850000,
      totalExpenses: 320000,
    }
  },
  getChartData: async () => {
    await delay(600)
    return {
      salesChart: [
        { month: "يناير", value: 180000 },
        { month: "فبراير", value: 220000 },
        { month: "مارس", value: 195000 },
        { month: "أبريل", value: 280000 },
        { month: "مايو", value: 245000 },
        { month: "يونيو", value: 310000 },
      ],
      productionChart: [
        { month: "يناير", value: 1200 },
        { month: "فبراير", value: 1450 },
        { month: "مارس", value: 1300 },
        { month: "أبريل", value: 1680 },
        { month: "مايو", value: 1520 },
        { month: "يونيو", value: 1890 },
      ],
    }
  },
}

// Inventory API
export const inventoryApi = {
  getMaterials: async () => {
    await delay(500)
    return [
      { id: 1, name: "ذرة صفراء", quantity: 5000, unit: "كغ", minStock: 1000, price: 2500 },
      { id: 2, name: "صويا", quantity: 3200, unit: "كغ", minStock: 800, price: 4500 },
      { id: 3, name: "نخالة قمح", quantity: 450, unit: "كغ", minStock: 500, price: 1800 },
      { id: 4, name: "شعير", quantity: 2800, unit: "كغ", minStock: 600, price: 2200 },
      { id: 5, name: "فيتامينات", quantity: 120, unit: "كغ", minStock: 50, price: 15000 },
    ]
  },
  addMaterial: async (material: { name: string; quantity: number; unit: string; minStock: number; price: number }) => {
    await delay(400)
    return { id: Date.now(), ...material }
  },
  updateMaterial: async (
    id: number,
    material: Partial<{ name: string; quantity: number; unit: string; minStock: number; price: number }>,
  ) => {
    await delay(400)
    return { id, ...material }
  },
  deleteMaterial: async (id: number) => {
    await delay(300)
    return { success: true, id }
  },
}

// Production API
export const productionApi = {
  getOperations: async () => {
    await delay(500)
    return [
      {
        id: 1,
        date: "2024-01-15",
        product: "علف دواجن",
        quantity: 500,
        materials: [
          { name: "ذرة صفراء", quantity: 300 },
          { name: "صويا", quantity: 150 },
        ],
      },
      {
        id: 2,
        date: "2024-01-14",
        product: "علف أبقار",
        quantity: 800,
        materials: [
          { name: "شعير", quantity: 500 },
          { name: "نخالة قمح", quantity: 200 },
        ],
      },
      {
        id: 3,
        date: "2024-01-13",
        product: "علف أغنام",
        quantity: 350,
        materials: [
          { name: "ذرة صفراء", quantity: 200 },
          { name: "شعير", quantity: 100 },
        ],
      },
    ]
  },
  addOperation: async (operation: {
    product: string
    quantity: number
    materials: { name: string; quantity: number }[]
  }) => {
    await delay(400)
    return { id: Date.now(), date: new Date().toISOString().split("T")[0], ...operation }
  },
}

// Invoices API
export const invoicesApi = {
  getInvoices: async () => {
    await delay(500)
    return [
      {
        id: 1,
        invoiceNumber: "INV-001",
        customer: "محمد أحمد",
        date: "2024-01-15",
        total: 125000,
        paid: 100000,
        type: "جملة",
      },
      {
        id: 2,
        invoiceNumber: "INV-002",
        customer: "علي حسن",
        date: "2024-01-14",
        total: 45000,
        paid: 45000,
        type: "مفرق",
      },
      {
        id: 3,
        invoiceNumber: "INV-003",
        customer: "خالد سعيد",
        date: "2024-01-13",
        total: 280000,
        paid: 150000,
        type: "جملة",
      },
      {
        id: 4,
        invoiceNumber: "INV-004",
        customer: "عمر يوسف",
        date: "2024-01-12",
        total: 35000,
        paid: 0,
        type: "مفرق",
      },
    ]
  },
  createInvoice: async (invoice: {
    customer: string
    items: { product: string; quantity: number; price: number }[]
    type: string
    paid: number
  }) => {
    await delay(400)
    const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    return {
      id: Date.now(),
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      total,
      ...invoice,
    }
  },
  recordPayment: async (invoiceId: number, amount: number) => {
    await delay(300)
    return { success: true, invoiceId, amount }
  },
}

// Debts API
export const debtsApi = {
  getDebts: async () => {
    await delay(500)
    return [
      { id: 1, customerName: "محمد أحمد", phone: "0912345678", remainingAmount: 25000, unpaidInvoices: 1 },
      { id: 2, customerName: "خالد سعيد", phone: "0923456789", remainingAmount: 130000, unpaidInvoices: 2 },
      { id: 3, customerName: "عمر يوسف", phone: "0934567890", remainingAmount: 35000, unpaidInvoices: 1 },
      { id: 4, customerName: "سامي محمود", phone: "0945678901", remainingAmount: 75000, unpaidInvoices: 3 },
    ]
  },
  getDebtDetails: async (customerId: number) => {
    await delay(400)
    return {
      customer: { id: customerId, name: "محمد أحمد", phone: "0912345678" },
      invoices: [
        { id: 1, invoiceNumber: "INV-001", date: "2024-01-15", total: 125000, paid: 100000, remaining: 25000 },
      ],
      payments: [
        { id: 1, date: "2024-01-16", amount: 50000 },
        { id: 2, date: "2024-01-18", amount: 50000 },
      ],
    }
  },
  recordPayment: async (customerId: number, amount: number) => {
    await delay(300)
    return { success: true, customerId, amount, date: new Date().toISOString() }
  },
}

// Customers API
export const customersApi = {
  getCustomers: async () => {
    await delay(500)
    return [
      { id: 1, name: "محمد أحمد", phone: "0912345678", address: "دمشق - المزة" },
      { id: 2, name: "علي حسن", phone: "0923456789", address: "حلب - العزيزية" },
      { id: 3, name: "خالد سعيد", phone: "0934567890", address: "حمص - الوعر" },
      { id: 4, name: "عمر يوسف", phone: "0945678901", address: "اللاذقية - الزراعة" },
      { id: 5, name: "سامي محمود", phone: "0956789012", address: "طرطوس - الكورنيش" },
    ]
  },
  addCustomer: async (customer: { name: string; phone: string; address: string }) => {
    await delay(400)
    return { id: Date.now(), ...customer }
  },
  updateCustomer: async (id: number, customer: Partial<{ name: string; phone: string; address: string }>) => {
    await delay(400)
    return { id, ...customer }
  },
  deleteCustomer: async (id: number) => {
    await delay(300)
    return { success: true, id }
  },
}

// Expenses API
export const expensesApi = {
  getVehicleExpenses: async () => {
    await delay(500)
    return [
      { id: 1, date: "2024-01-15", description: "وقود شاحنة 1", amount: 150000 },
      { id: 2, date: "2024-01-14", description: "صيانة محرك", amount: 450000 },
      { id: 3, date: "2024-01-10", description: "إطارات جديدة", amount: 800000 },
    ]
  },
  getWorkerExpenses: async () => {
    await delay(500)
    return [
      { id: 1, date: "2024-01-15", description: "رواتب العمال", amount: 2500000 },
      { id: 2, date: "2024-01-10", description: "مكافآت", amount: 300000 },
      { id: 3, date: "2024-01-05", description: "تأمينات", amount: 150000 },
    ]
  },
  addExpense: async (expense: { type: "vehicle" | "worker"; date: string; description: string; amount: number }) => {
    await delay(400)
    return { id: Date.now(), ...expense }
  },
}

// Settings API
export const settingsApi = {
  getSettings: async () => {
    await delay(300)
    return {
      factoryName: "معمل الأمل للأعلاف",
      phone: "0911234567",
      currency: "SYP",
      exchangeRate: 15000,
      minStockAlert: 500,
    }
  },
  updateSettings: async (settings: {
    factoryName?: string
    phone?: string
    currency?: string
    exchangeRate?: number
    minStockAlert?: number
  }) => {
    await delay(400)
    return { success: true, ...settings }
  },
}

// Reports API
export const reportsApi = {
  getSalesReport: async (startDate: string, endDate: string) => {
    await delay(600)
    return {
      totalSales: 2450000,
      invoiceCount: 45,
      topProducts: [
        { name: "علف دواجن", sales: 1200000 },
        { name: "علف أبقار", sales: 850000 },
        { name: "علف أغنام", sales: 400000 },
      ],
    }
  },
  getInventoryReport: async () => {
    await delay(500)
    return {
      totalValue: 45000000,
      lowStockItems: 2,
      categories: [
        { name: "مواد أولية", count: 5, value: 35000000 },
        { name: "منتجات جاهزة", count: 3, value: 10000000 },
      ],
    }
  },
  getDebtsReport: async () => {
    await delay(500)
    return {
      totalDebts: 850000,
      customersWithDebts: 4,
      overdueDebts: 265000,
    }
  },
}
