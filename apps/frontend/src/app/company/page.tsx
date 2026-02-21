import { Metadata } from 'next';
import { fetchSiteContent, fetchProductionSites } from "@/lib/api";
import CompanyClient from './CompanyClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const content = await fetchSiteContent();

    const title = content.company_title || "Инженерный Центр | ТД РусСтанкоСбыт";
    const subtitle = content.company_subtitle || "Комплексное техническое перевооружение промышленных предприятий России";

    return {
        title: `${title} | О компании`,
        description: subtitle,
        openGraph: {
            title,
            description: subtitle,
            url: 'https://td-rss.ru/company',
            siteName: 'ТД РусСтанкоСбыт',
            images: [{ url: 'https://td-rss.ru/images/company-og.jpg' }],
            type: 'website',
        },
    };
}

export default async function CompanyPage() {
    const [content, sites] = await Promise.all([
        fetchSiteContent(),
        fetchProductionSites()
    ]);

    const title = content.company_title || "Инженерный Центр";
    const subtitle = content.company_subtitle || "Комплексное техническое перевооружение промышленных предприятий России";

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
                name: 'О компании',
                item: 'https://td-rss.ru/company'
            }
        ]
    };

    return (
        <div className="pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
            />

            {/* Header */}
            <div className="container mx-auto px-6 mb-16">
                <div className="border-b border-industrial-border pb-6">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                        {title.split(' ').map((word, i) =>
                            i === 1 ? <span key={i} className="text-safety-orange">{word}</span> : word + ' '
                        )}
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm max-w-2xl uppercase">
                        {subtitle}
                    </p>
                </div>
            </div>

            <CompanyClient initialContent={content} initialSites={sites} />
        </div>
    );
}
