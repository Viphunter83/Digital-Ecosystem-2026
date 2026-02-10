import { Metadata } from 'next';
import { fetchServiceBySlug, fetchFeaturedInstance } from "@/lib/api";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import ServiceClient from './ServiceClient';
import { Wrench, Cog } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
    const service = await fetchServiceBySlug('remont-i-modernizatsiya');

    const title = service?.title || "Ремонт и модернизация станков | ТД РусСтанкоСбыт";
    const description = service?.description || "Комплексное техническое обслуживание, капитальный ремонт и модернизация металлообрабатывающего оборудования.";

    return {
        title: `${title} | Сервисный центр`,
        description,
        openGraph: {
            title,
            description,
            url: 'https://td-rss.ru/service',
            siteName: 'ТД РусСтанкоСбыт',
            images: [{ url: 'https://td-rss.ru/images/service-og.jpg' }],
            type: 'website',
        },
    };
}

export default async function ServicePage() {
    const [service, featuredMachine] = await Promise.all([
        fetchServiceBySlug('remont-i-modernizatsiya'),
        fetchFeaturedInstance()
    ]);

    const breadcrumbsJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Главная',
                item: 'https://td-rss.ru'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Сервисный центр',
                item: 'https://td-rss.ru/service'
            }
        ]
    };

    return (
        <main className="min-h-screen bg-industrial-surface text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
            />
            <NavBar />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden border-b border-white/5">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-safety-orange/10 border border-safety-orange/20 text-safety-orange text-xs font-mono uppercase tracking-widest mb-6">
                            <Wrench size={14} />
                            Industrial Service & Upgrade
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight leading-none">
                            {service?.title || "РЕМОНТ И МОДЕРНИЗАЦИЯ"}
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                            {service?.description || "Комплексное техническое обслуживание и обновление станочного парка."}
                        </p>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-safety-orange/5 to-transparent -z-10" />
                <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none">
                    <Cog size={400} className="animate-[spin_20s_linear_infinite]" />
                </div>
            </section>

            <ServiceClient initialService={service} initialMachine={featuredMachine} />

            <Footer />
        </main>
    );
}
