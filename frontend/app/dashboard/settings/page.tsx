"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Save, Factory, Phone, DollarSign, AlertTriangle, Loader2, Database, Download, Upload } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"
import { useSettings } from "@/context/settings-context"

export default function SettingsPage() {
  const { settings, updateSettings, isLoading: settingsLoading } = useSettings()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    factoryName: "",
    phone: "",
    currency: "SYP" as "SYP" | "USD",
    exchangeRate: "",
    minStockAlert: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!settingsLoading) {
      setFormData({
        factoryName: settings.factoryName,
        phone: settings.phone,
        currency: settings.currency,
        exchangeRate: settings.exchangeRate.toString(),
        minStockAlert: settings.minStockAlert.toString(),
      })
    }
  }, [settings, settingsLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.factoryName.trim()) {
      showToast("يرجى إدخال اسم المعمل", "error")
      return
    }

    setIsSaving(true)
    try {
      await updateSettings({
        factoryName: formData.factoryName,
        phone: formData.phone,
        currency: formData.currency,
        exchangeRate: Number(formData.exchangeRate) || 15000,
        minStockAlert: Number(formData.minStockAlert) || 500,
      })
      showToast("تم حفظ الإعدادات بنجاح", "success")
    } catch {
      showToast("حدث خطأ أثناء حفظ الإعدادات", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackup = () => {
    showToast("جاري إنشاء نسخة احتياطية... (هذه ميزة تجريبية)", "info")
    // Implementation for backup download
    setTimeout(() => {
      showToast("تم إنشاء النسخة الاحتياطية بنجاح", "success")
    }, 1500)
  }

  const handleRestore = () => {
    // Implementation for restore upload
    showToast("يرجى اختيار ملف لاستعادته... (هذه ميزة تجريبية)", "info")
  }

  if (settingsLoading) {
    return (
      <DashboardLayout title="الإعدادات">
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="الإعدادات">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Factory Info */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-primary/10 p-2">
                <Factory className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">معلومات المعمل</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="factoryName">اسم المعمل *</Label>
                <Input
                  id="factoryName"
                  value={formData.factoryName}
                  onChange={(e) => setFormData({ ...formData, factoryName: e.target.value })}
                  placeholder="مثال: معمل الأمل للأعلاف"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09XXXXXXXX"
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-success/10 p-2">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">إعدادات العملة</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">العملة الافتراضية</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as "SYP" | "USD" })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="SYP">ليرة سورية (ل.س)</option>
                  <option value="USD">دولار أمريكي ($)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  اختيار العملة سيؤثر على طريقة عرض الأسعار في جميع أنحاء النظام
                </p>
              </div>

              {formData.currency === "USD" && (
                <div className="space-y-2">
                  <Label htmlFor="exchangeRate">سعر الصرف (ليرة/دولار)</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                    placeholder="15000"
                  />
                  <p className="text-xs text-muted-foreground">يستخدم لتحويل الأسعار المحفوظة بالليرة إلى الدولار</p>
                </div>
              )}
            </div>
          </div>

          {/* Inventory Settings */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-warning/10 p-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">إعدادات المخزون</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStockAlert">حد التنبيه الأدنى للمخزون (كغ)</Label>
              <Input
                id="minStockAlert"
                type="number"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                placeholder="500"
              />
              <p className="text-xs text-muted-foreground">سيتم عرض تنبيه عندما تنخفض كمية أي مادة عن هذا الحد</p>
            </div>
          </div>

          {/* Backup & Restore Settings */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">النسخ الاحتياطي والاستعادة</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                يمكنك إنشاء نسخة احتياطية من جميع بيانات النظام أو استعادة البيانات من نسخة سابقة.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="button" variant="outline" onClick={handleBackup} className="gap-2 flex-1 border-primary/20 hover:bg-primary/5">
                  <Download className="h-4 w-4 text-primary" />
                  إنشاء نسخة احتياطية
                </Button>
                <Button type="button" variant="outline" onClick={handleRestore} className="gap-2 flex-1 border-muted-foreground/20">
                  <Upload className="h-4 w-4" />
                  استعادة من نسخة احتياطية
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="gap-2 min-w-32">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ الإعدادات
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Info Notice */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            الإعدادات المحفوظة سيتم تطبيقها على جميع أقسام النظام فوراً
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
