import { fetchProjectById, sanitizeUrl } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Building2, CheckCircle2 } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function ProjectPage({ params }: { params: { id: string } }) {
    const project = await fetchProjectById(params.id);

    if (!project) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-industrial-surface text-foreground font-sans selection:bg-safety-orange selection:text-white pb-24">

            {/* Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-deep-graphite">
                {project.image_url && (
                    <Image
                        src={sanitizeUrl(project.image_url)!}
                        alt={project.title}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-industrial-surface via-industrial-surface/50 to-transparent" />

                <div className="absolute top-8 left-0 w-full z-20 px-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase font-mono text-xs tracking-widest border border-white/10 px-4 py-2 bg-black/20 backdrop-blur rounded-sm hover:border-safety-orange/50">
                        <ArrowLeft className="w-4 h-4" />
                        Назад на главную
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
                    <div className="container mx-auto">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-safety-orange mb-2">
                                <div className="h-[2px] w-12 bg-safety-orange" />
                                <span className="font-mono text-sm uppercase tracking-widest font-bold">Реализованный проект</span>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black uppercase text-white tracking-tighter max-w-4xl break-words hyphens-auto">
                                {project.title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Sidebar Meta */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-industrial-panel border border-white/5 p-8 backdrop-blur-md sticky top-8">
                            <h3 className="text-white font-bold uppercase tracking-wider mb-6 border-b border-white/10 pb-4">Детали проекта</h3>

                            <div className="space-y-6 font-mono text-sm">
                                <div className="flex items-start gap-4">
                                    <Building2 className="w-5 h-5 text-safety-orange shrink-0" />
                                    <div>
                                        <div className="text-white/40 uppercase text-xs mb-1">Заказчик</div>
                                        <div className="text-white font-bold">{project.client?.name || "Конфиденциально"}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <MapPin className="w-5 h-5 text-safety-orange shrink-0" />
                                    <div>
                                        <div className="text-white/40 uppercase text-xs mb-1">Локация</div>
                                        <div className="text-white font-bold">{project.region || "РФ"}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Calendar className="w-5 h-5 text-safety-orange shrink-0" />
                                    <div>
                                        <div className="text-white/40 uppercase text-xs mb-1">Год реализации</div>
                                        <div className="text-white font-bold">{project.year || "2023-2025"}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <button className="w-full bg-safety-orange text-white py-4 font-bold uppercase tracking-widest hover:bg-safety-orange-vivid transition-colors text-xs">
                                    Скачать презентацию
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="prose prose-invert prose-lg max-w-none">
                            <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed mb-8 border-l-4 border-safety-orange pl-6">
                                {project.description || "Описание проекта засекречено или находится в стадии наполнения."}
                            </p>

                            {/* Mock Content Generation based on available fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                                <div className="bg-white/5 p-6 border border-white/5">
                                    <h4 className="flex items-center gap-2 font-bold uppercase text-white mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-safety-orange" />
                                        Поставленная задача
                                    </h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Обеспечить бесперебойную работу станочного парка в условиях высокой нагрузки. Модернизация существующего оборудования для повышения точности обработки до 0.05 мм.
                                    </p>
                                </div>
                                <div className="bg-white/5 p-6 border border-white/5">
                                    <h4 className="flex items-center gap-2 font-bold uppercase text-white mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-safety-orange" />
                                        Результат внедрения
                                    </h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Увеличение производительности на 35%. Снижение брака до 0.2%. Полный переход на отечественные комплектующие в рамках программы импортозамещения.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
