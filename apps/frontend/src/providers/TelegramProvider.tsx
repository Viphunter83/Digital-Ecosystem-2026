"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { TelegramWebApp } from "../types/telegram";

import { useTelegramAuth } from "@/hooks/useTelegramAuth";

interface TelegramContextType {
    webApp: TelegramWebApp | null;
    user: TelegramWebApp['initDataUnsafe']['user'] | null;
    isReady: boolean;
    isAuthenticated: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
    webApp: null,
    user: null,
    isReady: false,
    isAuthenticated: false,
});

export const useTelegram = () => useContext(TelegramContext);

export function TelegramProvider({ children }: { children: ReactNode }) {
    const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Auth Hook
    const { isAuthenticated } = useTelegramAuth();

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            setWebApp(tg);
            setIsReady(true);

            // Auto-expand
            tg.expand();

            // Ready notification
            // @ts-ignore
            if (tg.ready) tg.ready();
        }
    }, []);

    const value = {
        webApp,
        user: webApp?.initDataUnsafe?.user || null,
        isReady,
        isAuthenticated
    };

    return (
        <TelegramContext.Provider value={value}>
            {children}
        </TelegramContext.Provider>
    );
}
