"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string | null;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    totalAmount: number;
    telegramUser?: {
        id?: number;
        first_name?: string;
        last_name?: string;
        username?: string;
    };
    onSuccess: () => void;
}

export function CheckoutModal({
    isOpen,
    onClose,
    items,
    totalAmount,
    telegramUser,
    onSuccess,
}: CheckoutModalProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill from Telegram if available
    const [formData, setFormData] = useState({
        name: telegramUser?.first_name
            ? `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`
            : "",
        phone: "",
        email: "",
        comment: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Укажите ваше имя";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Укажите номер телефона";
        } else if (!/^[\d\s\+\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = "Некорректный номер телефона";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Некорректный email";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            if (telegramUser && (window as any).Telegram?.WebApp) {
                (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
            return;
        }

        setIsSubmitting(true);

        const orderData = {
            source: "cart_order",
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
            message: formData.comment || `Заказ на сумму ${totalAmount.toLocaleString()} ₽`,
            meta: {
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                total: totalAmount,
                telegram_user: telegramUser || undefined,
            }
        };

        try {
            const response = await fetch('/api/ingest/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error("Failed to submit order");
            }

            const result = await response.json();

            // Store order info for success page
            sessionStorage.setItem('lastOrder', JSON.stringify({
                id: result.lead_id || Date.now().toString(),
                total: totalAmount,
                itemsCount: items.length,
                name: formData.name,
            }));

            // Haptic success
            if (telegramUser && (window as any).Telegram?.WebApp) {
                (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

            onSuccess();
            onClose();
            router.push('/cart/success');

            toast.success("Заявка успешно отправлена", {
                description: "Мы свяжемся с вами в ближайшее время."
            });

        } catch (e) {
            console.error("Checkout error:", e);
            if (telegramUser && (window as any).Telegram?.WebApp) {
                (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
            toast.error("Ошибка при оформлении заказа", {
                description: "Попробуйте позже или свяжитесь с нами через Telegram."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-industrial-panel border-industrial-border text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase tracking-tight">
                        Оформление заказа
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Заполните контактные данные для связи с менеджером
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-mono uppercase text-gray-400">
                            Имя <span className="text-safety-orange">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={handleChange('name')}
                            placeholder="Иван Иванов"
                            className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-mono uppercase text-gray-400">
                            Телефон <span className="text-safety-orange">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange('phone')}
                            placeholder="+7 (999) 123-45-67"
                            className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs">{errors.phone}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-mono uppercase text-gray-400">
                            Email <span className="text-white/30">(необязательно)</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            placeholder="email@example.com"
                            className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment" className="text-sm font-mono uppercase text-gray-400">
                            Комментарий <span className="text-white/30">(необязательно)</span>
                        </Label>
                        <textarea
                            id="comment"
                            value={formData.comment}
                            onChange={handleChange('comment')}
                            placeholder="Дополнительные пожелания..."
                            rows={3}
                            className="w-full rounded-md bg-black/50 border border-white/20 text-white placeholder:text-white/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-safety-orange focus:border-transparent"
                        />
                    </div>

                    {/* Order Summary */}
                    <div className="bg-black/30 border border-white/10 p-3 rounded">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-mono uppercase">
                                {items.length} позиций
                            </span>
                            <span className="font-bold text-safety-orange font-mono">
                                {totalAmount.toLocaleString()} ₽
                            </span>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-2 px-6 uppercase tracking-wider text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Отправка...
                                </>
                            ) : (
                                <>
                                    Отправить заявку
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
