"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { TelegramWebApp } from "../types/telegram";

import { useTelegramAuth } from "@/hooks/useTelegramAuth";

interface TelegramContextType {
    webApp: TelegramWebApp | null;
    user: TelegramWebApp['initDataUnsafe']['user'] | null;
    isReady: boolean;
    isAuthenticated: boolean;
    isTma: boolean; // True only when running inside real Telegram Mini App
}

const TelegramContext = createContext<TelegramContextType>({
    webApp: null,
    user: null,
    isReady: false,
    isAuthenticated: false,
    isTma: false,
});

export const useTelegram = () => useContext(TelegramContext);

export function TelegramProvider({ children }: { children: ReactNode }) {
    const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isTma, setIsTma] = useState(false);

    // Auth Hook
    const { isAuthenticated } = useTelegramAuth();

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            setWebApp(tg);
            setIsReady(true);

            // Check if we're in a REAL Telegram Mini App (has initData or user)
            const hasInitData = !!(tg.initData && tg.initData.length > 0);
            const hasUser = !!(tg.initDataUnsafe?.user?.id);
            const isRealTma = hasInitData || hasUser;
            setIsTma(isRealTma);

            // Auto-expand only in real TMA
            if (isRealTma) {
                tg.expand();
                // @ts-ignore
                if (tg.ready) tg.ready();
            }
        }
    }, []);

    const value = {
        webApp,
        user: webApp?.initDataUnsafe?.user || null,
        isReady,
        isAuthenticated,
        isTma
    };

    return (
        <TelegramContext.Provider value={value}>
            {children}
        </TelegramContext.Provider>
    );
}

