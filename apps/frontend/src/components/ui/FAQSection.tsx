"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import Script from "next/script"

const faqData = [
    {
        category: "Оплата и Доставка (Для Снабженцев)",
        items: [
            {
                question: "Вы работаете с НДС?",
                answer: "Да, все цены включают НДС 20%. Мы предоставляем полный пакет закрывающих документов через ЭДО (Диадок/СБИС) или курьером."
            },
            {
                question: "Как быстро происходит отгрузка?",
                answer: "Складские позиции (2500+ SKU) отгружаются в день оплаты. Сложные узлы — от 3 дней."
            }
        ]
    },
    {
        category: "Технические вопросы (Для Инженеров)",
        items: [
            {
                question: "Есть ли гарантия на запчасти после ремонта?",
                answer: "Да. 12 месяцев на новые узлы и 6 месяцев на восстановленные. Мы прикладываем паспорт качества к каждому изделию."
            },
            {
                question: "Выезжают ли ваши специалисты в регионы?",
                answer: "Наша сервисная бригада работает по всей РФ. Выезд для диагностики — от 24 часов после заявки."
            }
        ]
    },
    {
        category: "Финансы (Для Директоров)",
        items: [
            {
                question: "Возможен ли лизинг на модернизацию?",
                answer: "Мы аккредитованы в сберЛизинг и ВТБ Лизинг. Возможна рассрочка платежа для госпредприятий."
            }
        ]
    }
]

export function FAQSection() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.flatMap(section =>
            section.items.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer
                }
            }))
        )
    }

    return (
        <section className="py-24 bg-background">
            <Script
                id="faq-json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-manrope font-bold mb-12 text-white">
                    Часто задаваемые вопросы
                </h2>

                <div className="space-y-12">
                    {faqData.map((section, idx) => (
                        <div key={idx} className="space-y-6">
                            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider pl-1 font-bold">
                                {section.category}
                            </h3>

                            <Accordion type="single" collapsible className="space-y-4">
                                {section.items.map((item, itemIdx) => (
                                    <AccordionItem
                                        key={itemIdx}
                                        value={`item-${idx}-${itemIdx}`}
                                        className="border border-white/10 bg-white/5 rounded-lg px-6 data-[state=open]:bg-white/[0.07] transition-colors duration-300"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-6 [&>svg]:hidden group">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-manrope font-bold text-lg text-left text-white pr-8 group-hover:text-safety-orange transition-colors">
                                                    {item.question}
                                                </span>

                                                <div className="relative flex items-center justify-center w-6 h-6 text-[#FF3D00]">
                                                    <motion.div
                                                        initial={false}
                                                        animate={{ opacity: 1 }}
                                                        className="absolute"
                                                    >
                                                        {/* We simulate the plus/minus morph or switch using CSS group state or external state 
                               Since AccordionTrigger doesn't expose state easily to children without context,
                               we rely on the group-data-[state=open] selector for simple switching or assume generic icon.
                               However, framer-motion requires value. 
                               Let's use CSS opacity transition for robustness with Radix.
                           */}
                                                        <Plus className="h-6 w-6 transition-transform duration-300 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0" />
                                                        <Minus className="h-6 w-6 absolute top-0 left-0 transition-transform duration-300 -rotate-90 opacity-0 group-data-[state=open]:rotate-0 group-data-[state=open]:opacity-100" />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-6 pt-0">
                                            <p className="font-sans text-gray-300 leading-relaxed text-base">
                                                {item.answer}
                                            </p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
