"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, ShieldCheck, Activity, BrainCircuit, Cpu } from "lucide-react";
import { useForm } from "react-hook-form";

type DiagnosticStep = 'start' | 'type' | 'age' | 'issues' | 'analyzing' | 'result';
type MachineType = 'lathe' | 'milling' | 'cnc_center';

interface DiagnosticData {
    type: MachineType | null;
    age: number;
    issues: string[];
    contact: { phone: string; email: string };
}

const MACHINE_TYPES = [
    { id: 'lathe', label: 'ТОКАРНЫЙ', icon: Activity },
    { id: 'milling', label: 'ФРЕЗЕРНЫЙ', icon: Cpu },
    { id: 'cnc_center', label: 'ОБРАБ. ЦЕНТР', icon: BrainCircuit },
];

const COMMON_ISSUES = [
    "Вибрация шпинделя",
    "Перегрев гидравлики",
    "Сбой позиционирования",
    "Шум в коробке подач",
    "Люфт осей",
    "Ошибка ATC"
];

import { useTelegram } from "@/providers/TelegramProvider";

export function DiagnosticsWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { webApp, user } = useTelegram();
    const [step, setStep] = useState<DiagnosticStep>('start');
    const [data, setData] = useState<DiagnosticData>({
        type: null,
        age: 5,
        issues: [],
        contact: { phone: '', email: '' }
    });

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('start');
            setData({ type: null, age: 5, issues: [], contact: { phone: '', email: '' } });
            webApp?.HapticFeedback.impactOccurred('medium');
        }
    }, [isOpen, webApp]);

    // Handle MainButton
    useEffect(() => {
        if (!webApp) return;
        const mainBtn = webApp.MainButton;

        const onMainBtnClick = () => {
            webApp.HapticFeedback.impactOccurred('light');
            handleNext();
        };

        mainBtn.onClick(onMainBtnClick);

        if (isOpen) {
            if (step === 'start') {
                mainBtn.setText("ЗАПУСТИТЬ ТЕСТ");
                mainBtn.show();
            } else if (step === 'type' && data.type) {
                mainBtn.setText("ДАЛЕЕ >");
                mainBtn.show();
            } else if (step === 'age') {
                mainBtn.setText("ПОДТВЕРДИТЬ ВОЗРАСТ");
                mainBtn.show();
            } else if (step === 'issues') {
                mainBtn.setText("ЗАПУСТИТЬ АНАЛИЗ");
                mainBtn.show();
            } else if (step === 'result') {
                // In result step, we might want a different action or hide it until form is filled
                mainBtn.hide();
            } else {
                mainBtn.hide();
            }
        } else {
            mainBtn.hide();
        }

        return () => {
            mainBtn.offClick(onMainBtnClick);
        };
    }, [isOpen, step, data.type, webApp]);

    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleNext = async () => {
        if (step === 'start') setStep('type');
        else if (step === 'type') setStep('age');
        else if (step === 'age') setStep('issues');
        else if (step === 'issues') {
            setStep('analyzing');

            try {
                // Real API Call
                const response = await fetch('/api/diagnostics/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        machine_type: data.type,
                        age: data.age,
                        symptoms: data.issues
                    })
                });

                if (!response.ok) throw new Error("Analysis failed");

                const result = await response.json();
                setAnalysisResult(result);

                // Artificial delay for UX (to show the "AI thinking" animation)
                setTimeout(() => {
                    setStep('result');
                    webApp?.HapticFeedback.notificationOccurred('success');
                }, 2000);

            } catch (e) {
                console.error(e);
                alert("Ошибка анализа. Попробуйте еще раз.");
                setStep('issues');
            }
        }
    };

    const updateData = (updates: Partial<DiagnosticData>) => {
        setData(prev => ({ ...prev, ...updates }));
        webApp?.HapticFeedback.selectionChanged();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 w-full max-w-2xl bg-black border border-safety-orange/50 shadow-[0_0_50px_rgba(255,61,0,0.15)] overflow-hidden rounded-sm"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-white/10 bg-white/5 gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 text-safety-orange font-mono">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">System Diagnostics v.1.0</span>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors absolute top-4 right-4 sm:static">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-8 h-[500px] sm:h-[400px] bg-[url('/grid-pattern.svg')] bg-center relative overflow-y-auto">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-safety-orange/50 to-transparent" />

                    <AnimatePresence mode="wait">
                        {step === 'start' && (
                            <StepStart onNext={handleNext} key="start" isTma={!!webApp} />
                        )}
                        {step === 'type' && (
                            <StepType
                                selected={data.type}
                                onSelect={(type) => updateData({ type })}
                                onNext={handleNext}
                                key="type"
                                isTma={!!webApp}
                            />
                        )}
                        {step === 'age' && (
                            <StepAge
                                value={data.age}
                                onChange={(age) => updateData({ age })}
                                onNext={handleNext}
                                key="age"
                                isTma={!!webApp}
                            />
                        )}
                        {step === 'issues' && (
                            <StepIssues
                                selected={data.issues}
                                onSelect={(issues) => updateData({ issues })}
                                onNext={handleNext}
                                key="issues"
                                isTma={!!webApp}
                            />
                        )}
                        {step === 'analyzing' && (
                            <StepAnalyzing key="analyzing" />
                        )}
                        {step === 'result' && (
                            <StepResult data={data} result={analysisResult} onClose={onClose} key="result" user={user} />
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Progress */}
                <div className="p-2 border-t border-white/10 bg-black flex justify-between items-center px-4">
                    <div className="flex gap-1">
                        {['start', 'type', 'age', 'issues', 'analyzing', 'result'].map((s, i) => (
                            <div
                                key={s}
                                className={`h-1 w-8 rounded-full transition-colors ${['start', 'type', 'age', 'issues', 'analyzing', 'result'].indexOf(step) >= i
                                    ? 'bg-safety-orange'
                                    : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">Status: {step.toUpperCase()}</span>
                </div>
            </motion.div>
        </div>
    );
}

// --- Steps Components ---

function StepStart({ onNext, isTma }: { onNext: () => void; isTma?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-6"
        >
            <div className="w-20 h-20 rounded-full border border-safety-orange/30 flex items-center justify-center bg-safety-orange/5 animate-pulse">
                <ShieldCheck className="w-10 h-10 text-safety-orange" />
            </div>
            <div>
                <h2 className="text-2xl font-bold uppercase text-white mb-2">Диагностика Оборудования</h2>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                    Пройдите верификацию состояния станка за 30 секунд. ИИ-алгоритм выявит риски простоя.
                </p>
            </div>
            {!isTma && (
                <button
                    onClick={onNext}
                    className="bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-3 px-8 uppercase tracking-wider text-sm clip-path-slant transition-transform active:scale-95"
                >
                    Запустить Тест
                </button>
            )}
        </motion.div>
    );
}

function StepType({ selected, onSelect, onNext, isTma }: { selected: MachineType | null; onSelect: (t: MachineType) => void; onNext: () => void; isTma?: boolean }) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white mb-8 text-center uppercase tracking-wider">Тип Оборудования</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {MACHINE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selected === type.id;
                    return (
                        <button
                            key={type.id}
                            onClick={() => onSelect(type.id as MachineType)}
                            className={`p-6 border flex flex-col items-center gap-4 transition-all duration-300 ${isSelected
                                ? 'border-safety-orange bg-safety-orange/20 text-safety-orange shadow-[0_0_15px_rgba(255,61,0,0.3)]'
                                : 'border-white/20 bg-white/10 text-gray-300 hover:border-white/40 hover:bg-white/15'
                                }`}
                        >
                            <Icon className="w-8 h-8" />
                            <span className="text-xs font-bold font-mono uppercase tracking-wide">{type.label}</span>
                        </button>
                    )
                })}
            </div>
            {!isTma && (
                <div className="text-center">
                    <button
                        onClick={onNext}
                        disabled={!selected}
                        className="disabled:opacity-50 disabled:cursor-not-allowed text-white underline underline-offset-4 font-mono text-sm hover:text-safety-orange transition-colors"
                    >
                        ДАЛЕЕ &gt;
                    </button>
                </div>
            )}
        </motion.div>
    );
}

function StepAge({ value, onChange, onNext, isTma }: { value: number; onChange: (v: number) => void; onNext: () => void; isTma?: boolean }) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center items-center">
            <h3 className="text-xl font-bold text-white mb-12 text-center uppercase tracking-wider">Возраст Оборудования</h3>

            <div className="w-full max-w-sm mb-12">
                <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-safety-orange"
                />
                <div className="flex justify-between mt-4 text-xs font-mono text-muted-foreground">
                    <span>НОВЫЙ (0)</span>
                    <span className="text-safety-orange text-xl font-bold">{value} ЛЕТ</span>
                    <span>СТАРЫЙ (30+)</span>
                </div>
            </div>

            {!isTma && (
                <button
                    onClick={onNext}
                    className="bg-white/10 hover:bg-white/20 text-white font-mono py-2 px-8 uppercase text-sm border border-white/10 transition-colors"
                >
                    Подтвердить
                </button>
            )}
        </motion.div>
    );
}

function StepIssues({ selected, onSelect, onNext, isTma }: { selected: string[]; onSelect: (s: string[]) => void; onNext: () => void; isTma?: boolean }) {
    const toggleIssue = (issue: string) => {
        if (selected.includes(issue)) {
            onSelect(selected.filter(i => i !== issue));
        } else {
            onSelect([...selected, issue]);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white mb-2 text-center uppercase tracking-wider">Наблюдаемые Проблемы</h3>
            <p className="text-center text-xs text-muted-foreground mb-8">Выберите всё, что применимо</p>

            <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-lg mx-auto">
                {COMMON_ISSUES.map((issue) => (
                    <button
                        key={issue}
                        onClick={() => toggleIssue(issue)}
                        className={`px-4 py-2 rounded-full text-xs font-mono border transition-all ${selected.includes(issue)
                            ? 'bg-safety-orange text-white border-safety-orange'
                            : 'bg-transparent text-gray-300 border-white/20 hover:border-white/50 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        {issue}
                    </button>
                ))}
            </div>

            {!isTma && (
                <div className="text-center">
                    <button
                        onClick={onNext}
                        className="bg-white/10 hover:bg-white/20 text-white font-mono py-2 px-8 uppercase text-sm border border-white/10 transition-colors"
                    >
                        Запустить Анализ
                    </button>
                </div>
            )}
        </motion.div>
    );
}

function StepAnalyzing() {
    const [log, setLog] = useState("Initializing core...");

    useEffect(() => {
        const logs = [
            "Checking spindle vibration...",
            "Validating kinematic chain...",
            "Analyzing thermal displacement...",
            "Checking hydraulic pressure...",
            "Comparing with digital twin...",
            "Optimizing maintenance plan...",
            "DONE."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setLog(logs[i]);
                i++;
            }
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-safety-orange rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-safety-orange text-xs animate-pulse">
                    AI
                </div>
            </div>
            <div className="font-mono text-sm text-green-500 min-h-[20px]">
                &gt; {log}
            </div>
        </motion.div>
    );
}

function StepResult({ data, result, onClose, user }: { data: DiagnosticData; result: any; onClose: () => void; user: any }) {
    const { register, handleSubmit } = useForm();

    // Use real data from backend or fallback
    const riskLevel = result?.risk_level || 'НЕИЗВЕСТНО';
    const probability = result?.probability ? `${result.probability}%` : '---';
    const recommendation = result?.recommendation || "Требуется осмотр специалиста";

    const onSubmit = async (formData: any) => {
        console.log("LEAD GENERATED (TELEGRAM):", { ...data, ...formData, result });
        const message = `Заявка на ремонт:\nРиск: ${riskLevel}\nПроблема: ${recommendation}\nКонтакты: ${formData.phone || user?.username}`;

        try {
            const response = await fetch('/api/ingest/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: "diagnostics_widget",
                    name: user?.first_name || formData.phone || "Unknown User",
                    message: message,
                    meta: {
                        ...data,
                        analysis_result: result,
                        telegram_user: user
                    }
                })
            });

            if (response.ok) {
                alert("Отчет инженера отправлен куратору! Ожидайте звонка.");
                onClose();
            } else {
                throw new Error("Failed to submit lead");
            }
        } catch (e) {
            console.error("Diagnostic submit error:", e);
            alert("Ошибка отправки. Попробуйте позже.");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col justify-center items-center text-center">
            <div className="mb-6">
                <AlertTriangle className={`w-12 h-12 mx-auto mb-2 animate-pulse ${riskLevel === 'Critical' ? 'text-red-600' : 'text-yellow-500'}`} />
                <h2 className="text-xl font-black uppercase text-white mb-2">
                    Риск Износа: <span className={riskLevel === 'Critical' ? 'text-red-500' : 'text-yellow-500'}>{riskLevel}</span>
                </h2>
                <div className="bg-white/5 border border-white/10 p-4 rounded mb-4 max-w-sm mx-auto">
                    <p className="text-sm text-gray-300 mb-2">
                        Вероятность отказа: <span className="text-safety-orange font-bold">{probability}</span>
                    </p>
                    <p className="text-xs text-muted-foreground border-t border-white/10 pt-2 mt-2">
                        {recommendation}
                    </p>
                </div>
            </div>

            {user ? (
                <div className="w-full max-w-xs space-y-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">ПОЛУЧАТЕЛЬ ОТЧЕТА</p>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-white font-bold">{user.first_name} {user.last_name}</p>
                        </div>
                        <p className="text-sm text-safety-orange font-mono">@{user.username}</p>
                    </div>
                    <button
                        onClick={() => onSubmit({ phone: `@${user.username} (ID: ${user.id})` })}
                        className="w-full bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-3 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(255,61,0,0.4)] animate-pulse"
                    >
                        ОТПРАВИТЬ РЕЗУЛЬТАТ
                    </button>
                    <p className="text-[10px] text-center text-white/30">
                        *Вы успешно идентифицированы системой
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xs space-y-4">
                    <input
                        {...register("phone", { required: true })}
                        type="tel"
                        placeholder="Ваш Telegram для отчета"
                        className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none placeholder:text-muted-foreground/50 text-center"
                    />
                    <button
                        type="submit"
                        className="w-full bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-3 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(255,61,0,0.4)] animate-pulse"
                    >
                        Получить Отчет Инженера
                    </button>
                </form>
            )}
        </motion.div>
    );
}
