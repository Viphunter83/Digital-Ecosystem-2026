import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";

interface User {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export function useTelegramAuth() {
    const [auth, setAuth] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true
    });

    useEffect(() => {
        const login = async () => {
            // 1. Check environment
            if (typeof window === 'undefined') return;

            const telegram = (window as any).Telegram?.WebApp;
            if (!telegram) {
                // Fallback for browser testing (Dev Mode)
                console.warn("Telegram WebApp not found (Browser Mode)");
                setAuth(prev => ({ ...prev, isLoading: false }));
                return;
            }

            const initData = telegram.initData;
            if (!initData) {
                // Dev Mode or Guest
                setAuth(prev => ({ ...prev, isLoading: false }));
                return;
            }

            // 2. Check existing session
            const existingToken = sessionStorage.getItem("accessToken");
            if (existingToken) {
                setAuth({
                    user: telegram.initDataUnsafe?.user,
                    isAuthenticated: true,
                    isLoading: false
                });
                return;
            }

            // 3. Perform Login
            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ initData })
                });

                if (!res.ok) throw new Error("Auth Failed");

                const data = await res.json();

                // 4. Save Token
                sessionStorage.setItem("accessToken", data.access_token);

                setAuth({
                    user: telegram.initDataUnsafe?.user,
                    isAuthenticated: true,
                    isLoading: false
                });

            } catch (err) {
                console.error("Telegram Login Error:", err);
                telegram.showAlert("Ошибка авторизации. Сервисы могут быть недоступны.");
                setAuth(prev => ({ ...prev, isLoading: false }));
            }
        };

        login();
    }, []);

    return auth;
}
