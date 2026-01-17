
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { SettingsProvider } from "@/context/settings-context"
import { ToastProvider } from "@/components/ui/toast-context"
import LoginPage from "@/pages/Login"
import OverviewPage from "@/pages/Overview"
import MaterialsPage from "@/pages/Materials"
import InventoryPage from "@/pages/Inventory"
import PurchasesPage from "@/pages/Purchases"
import InvoicesPage from "@/pages/Invoices"
import DebtsPage from "@/pages/Debts"
import CustomersPage from "@/pages/Customers"
import ExpensesPage from "@/pages/Expenses"
import ReportsPage from "@/pages/Reports"
import SettingsPage from "@/pages/Settings"

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// Layout Wrapper to inject Settings/Auth logic if needed globally, but providers are outside
function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Routes>
              {/* We need to use the DashboardLayout in the specific page components, 
                  OR create a Layout route here. 
                  Since existing code uses wrapper layout per page,
                  we will define the routes and let components use the layout.
                  But for placeholders, I'll use a basic layout wrapper.
               */}
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="materials" element={<MaterialsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="purchases" element={<PurchasesPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="debts" element={<DebtsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Routes>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SettingsProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SettingsProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
