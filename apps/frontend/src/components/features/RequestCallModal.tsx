"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { API_URL } from "@/lib/api"

export function RequestCallModal({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        message: "",
        agreed: false
    })

    // Detect Telegram WebApp context
    const isTelegram = typeof window !== 'undefined' && (window as any).Telegram?.WebApp;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.agreed) {
            setError("Пожалуйста, подтвердите согласие на обработку персональных данных")
            return
        }

        setLoading(true)
        setError("")

        try {
            // Prepare payload
            const payload = {
                source: "site",
                name: formData.name,
                phone: formData.phone,
                message: formData.message,
                meta: {
                    userAgent: navigator.userAgent
                }
            }

            const res = await fetch(`${API_URL}/ingest/leads`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                throw new Error("Ошибка отправки")
            }

            setSuccess(true)

            // Auto close after 2s
            setTimeout(() => {
                setOpen(false)
                setSuccess(false)
                setFormData({ name: "", phone: "", message: "", agreed: false })
            }, 2000)

        } catch (err) {
            console.error(err)
            setError("Не удалось отправить заявку. Попробуйте позже.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-industrial-panel border-white/10 text-white">
                {success ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div className="rounded-full bg-green-500/20 p-3 border border-green-500/50">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight text-center">Заявка отправлена!</h3>
                        <p className="text-center text-gray-400 text-sm">Мы свяжемся с вами в ближайшее время.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white">Заказать звонок</DialogTitle>
                            <DialogDescription className="text-gray-400 text-sm">
                                Оставьте свои контакты, и мы перезвоним вам для уточнения деталей.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-xs uppercase font-mono tracking-widest text-gray-400">Ваше имя</Label>
                                <Input
                                    id="name"
                                    placeholder="Иван Иванов"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-safety-orange"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="text-xs uppercase font-mono tracking-widest text-gray-400">Телефон</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+7 (999) 000-00-00"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-safety-orange"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message" className="text-xs uppercase font-mono tracking-widest text-gray-400">Комментарий (необязательно)</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Меня интересует..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-safety-orange min-h-[80px]"
                                />
                            </div>

                            <div className="flex items-start space-x-3 py-2">
                                <input
                                    type="checkbox"
                                    id="agreed"
                                    checked={formData.agreed}
                                    onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-safety-orange focus:ring-safety-orange cursor-pointer"
                                    required
                                />
                                <label htmlFor="agreed" className="text-[10px] text-gray-500 leading-tight cursor-pointer selection:bg-transparent">
                                    Я даю согласие на обработку моих <a href="/privacy" className="text-safety-orange underline hover:text-orange-600">персональных данных</a> в соответствии с 152-ФЗ.
                                </label>
                            </div>

                            {error && <p className="text-xs text-red-500 bg-red-500/10 p-2 border border-red-500/20">{error}</p>}

                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading} className="w-full bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold h-12 uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(255,61,0,0.3)]">
                                {loading ? "Отправка..." : "Отправить заявку"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
