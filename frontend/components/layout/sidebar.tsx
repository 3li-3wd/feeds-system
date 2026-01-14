"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Factory,
  FileText,
  CreditCard,
  Users,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useSettings } from "@/context/settings-context"

const menuItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/dashboard/inventory", label: "المخزون", icon: Package },
  { href: "/dashboard/production", label: "الإنتاج", icon: Factory },
  { href: "/dashboard/invoices", label: "الفواتير", icon: FileText },
  { href: "/dashboard/debts", label: "الديون", icon: CreditCard },
  { href: "/dashboard/customers", label: "الزبائن", icon: Users },
  { href: "/dashboard/expenses", label: "المصاريف", icon: Receipt },
  { href: "/dashboard/reports", label: "التقارير", icon: BarChart3 },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { settings } = useSettings()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-card shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h1 className="text-lg font-bold text-foreground">{settings.factoryName}</h1>
              <p className="text-xs text-muted-foreground">نظام إدارة المعمل</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden rounded-lg p-2 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-border">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="lg:hidden rounded-lg p-2 hover:bg-muted transition-colors">
      <Menu className="h-6 w-6" />
    </button>
  )
}
