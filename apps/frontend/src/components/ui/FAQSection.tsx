"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { Plus, Minus, MessageCircleQuestion } from "lucide-react"
import Script from "next/script"
import { useEffect, useState } from "react"
import { fetchSiteContent } from "@/lib/api"
import { Button } from "@/components/ui/button"

export function FAQSection() {
    const [faqData, setFaqData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSiteContent().then(content => {
            if (content.faq_json) {
                try {
                    const parsed = JSON.parse(content.faq_json);
                    if (Array.isArray(parsed)) {
                        setFaqData(parsed);
                    }
                } catch (e) {
                    console.error("Failed to parse FAQ JSON", e);
                }
            }
            setIsLoading(false);
        });
    }, []);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.flatMap(section =>
            section.items.map((item: any) => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer
                }
            }))
        )
    }

    if (isLoading && faqData.length === 0) return null;

    return (
        <section className="py-24 bg-background border-t border-white/5 relative overflow-hidden">
            {/* Background glass effect blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-safety-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <Script
                id="faq-json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-safety-orange/10 border border-safety-orange/20 mb-4"
                        >
                            <span className="w-2 h-2 rounded-full bg-safety-orange animate-pulse" />
                            <span className="text-[10px] font-mono font-bold text-safety-orange uppercase tracking-widest">Knowledge Base</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-manrope font-bold text-white tracking-tight">
                            Часто задаваемые вопросы
                        </h2>
                    </div>
                    <p className="text-gray-400 font-sans max-w-xs text-sm leading-relaxed translate-y-[-8px]">
                        Экспертные ответы на ключевые вопросы о снабжении, сервисе и цифровизации производства.
                    </p>
                </div>

                <div className="space-y-16">
                    {faqData.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 pl-1">
                                <div className="h-[1px] w-8 bg-safety-orange/50" />
                                <h3 className="text-sm font-mono text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    {section.category}
                                </h3>
                            </div>

                            <Accordion type="single" collapsible className="space-y-4">
                                {section.items.map((item: any, itemIdx: number) => (
                                    <AccordionItem
                                        key={itemIdx}
                                        value={`item-${idx}-${itemIdx}`}
                                        className="border border-white/5 bg-white/[0.02] rounded-xl px-6 data-[state=open]:bg-white/[0.05] data-[state=open]:border-white/10 transition-all duration-300 group"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-6 [&>svg]:hidden">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-manrope font-semibold text-lg text-left text-white/90 pr-8 group-hover:text-white transition-colors">
                                                    {item.question}
                                                </span>

                                                <div className="relative flex items-center justify-center w-6 h-6 text-safety-orange/80 group-data-[state=open]:text-safety-orange transition-colors">
                                                    <Plus className="h-5 w-5 transition-all duration-300 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0" />
                                                    <Minus className="h-5 w-5 absolute transition-all duration-300 -rotate-90 opacity-0 group-data-[state=open]:rotate-0 group-data-[state=open]:opacity-100" />
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-6 pt-0">
                                            <p className="font-sans text-gray-400 leading-relaxed text-base border-l border-safety-orange/20 pl-6 ml-1">
                                                {item.answer}
                                            </p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-full bg-safety-orange/10 flex items-center justify-center text-safety-orange">
                            <MessageCircleQuestion className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-xl font-manrope font-bold text-white mb-1">Не нашли нужный ответ?</h4>
                            <p className="text-gray-400 text-sm">Свяжитесь с нашими инженерами для прямой консультации.</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="bg-transparent border-white/10 hover:border-safety-orange hover:text-safety-orange transition-all px-8 py-6 rounded-xl font-bold uppercase tracking-wider text-xs"
                        onClick={() => window.scrollTo({ top: document.getElementById('contact')?.offsetTop, behavior: 'smooth' })}
                    >
                        Задать свой вопрос
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}
