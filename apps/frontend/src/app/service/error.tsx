'use client';

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ServiceError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase mb-4">
                    Ошибка загрузки
                </h2>
                <p className="text-gray-400 mb-8">
                    Не удалось загрузить страницу сервиса. Проверьте подключение к интернету или попробуйте позже.
                </p>
                <Button
                    onClick={() => reset()}
                    className="bg-safety-orange hover:bg-white hover:text-black text-white font-bold"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Повторить
                </Button>
            </div>
        </div>
    );
}
