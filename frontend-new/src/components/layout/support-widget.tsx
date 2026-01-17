import { useState } from "react"
import { Link } from "react-router-dom"
import { ExternalLink, X } from "lucide-react"

export function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed bottom-4 left-4 z-[9999]">
            {isOpen && (
                <div className="absolute bottom-14 left-0 w-64 rounded-lg border border-border bg-card p-4 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                        <h3 className="font-semibold text-sm">الدعم الفني</h3>
                        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Telegram:</span>
                            <span className="text-muted-foreground select-all">@dev_hub_tm</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Whatsapp:</span>
                            <span className="text-muted-foreground select-all">0954795509</span>
                        </div>

                        <Link
                            to="/dashboard/about"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 w-full mt-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            About Product
                        </Link>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95 text-sm font-bold"
            >
                {isOpen ? <X className="h-6 w-6" /> : "D-H"}
            </button>
        </div>
    )
}
