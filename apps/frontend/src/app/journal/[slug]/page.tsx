import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { fetchArticleById, sanitizeUrl, getImageUrl, getVideoUrl } from '@/lib/api';
import { VideoPlayer } from '@/components/VideoPlayer';

type Props = {
    params: { slug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = params;
    const article = await fetchArticleById(slug);

    if (!article) {
        return {
            title: 'Материал не найден | ТД РусСтанкоСбыт',
        };
    }

    const title = `${article.title} | Инженерный журнал`;
    const description = article.summary || article.content?.substring(0, 160) || 'Читайте аналитические материалы о промышленном оборудовании и автоматизации.';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://td-rss.ru/journal/${article.slug || article.id}`,
            siteName: 'ТД РусСтанкоСбыт',
            type: 'article',
            publishedTime: article.published_at,
            authors: [article.author || 'Редакция'],
            images: article.image_url ? [{ url: article.image_url }] : [],
        },
    };
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = params;
    const article = await fetchArticleById(slug);

    if (!article) {
        return (
            <div className="min-h-screen bg-industrial-surface flex flex-col items-center justify-center text-white font-mono gap-4">
                <span>[ СТАТЬЯ НЕ НАЙДЕНА ]</span>
                <Link href="/" className="text-safety-orange hover:underline">[ ВЕРНУТЬСЯ НА ГЛАВНУЮ ]</Link>
            </div>
        );
    }

    // JSON-LD Structured Data for SEO
    const articleUrl = `https://td-rss.ru/journal/${article.slug || article.id}`;
    const jsonLd: any = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        image: article.image_url || 'https://td-rss.ru/images/journal-placeholder.jpg',
        datePublished: article.published_at || new Date().toISOString(),
        author: {
            '@type': 'Organization',
            name: 'ТД РусСтанкоСбыт'
        },
        publisher: {
            '@type': 'Organization',
            name: 'ТД РусСтанкоСбыт',
            logo: {
                '@type': 'ImageObject',
                url: 'https://td-rss.ru/icon.png'
            }
        },
        description: article.summary || article.content?.substring(0, 160),
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl
        }
    };

    // Add Video Schema if exists
    if (article.video_url) {
        jsonLd.video = {
            '@type': 'VideoObject',
            name: article.title,
            description: article.summary || article.title,
            thumbnailUrl: [sanitizeUrl(article.image_url) || 'https://td-rss.ru/images/journal-placeholder.jpg'],
            uploadDate: article.published_at || new Date().toISOString(),
            contentUrl: sanitizeUrl(article.video_url),
            embedUrl: sanitizeUrl(article.video_url)
        };
    }

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
                name: 'Журнал',
                item: 'https://td-rss.ru/journal'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: article.title,
                item: articleUrl
            }
        ]
    };

    return (
        <main className="min-h-screen bg-industrial-surface text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
            />

            {/* Hero Image */}
            <div className="relative w-full h-[60vh] mt-0">
                {getImageUrl(article) ? (
                    <Image
                        src={getImageUrl(article) || '/images/journal-placeholder.jpg'}
                        alt={article.title}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-industrial-panel/50 flex items-center justify-center">
                        <span className="font-mono text-muted-foreground">[ NO IMAGE ]</span>
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-industrial-surface via-industrial-surface/50 to-transparent" />

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
                    <div className="max-w-4xl">
                        <Link href="/" className="inline-block text-safety-orange font-mono text-xs uppercase mb-4 hover:underline">
                            ← Назад к журналу
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 leading-tight">
                            {article.title}
                        </h1>
                        <div className="flex gap-4 text-xs font-mono text-muted-foreground uppercase">
                            <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : '17.01.2026'}</span>
                            <span>// {article.author || 'РЕДАКЦИЯ'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-12 md:py-20">
                <div className="max-w-3xl mx-auto">
                    <article className="prose prose-invert prose-lg prose-headings:font-black prose-headings:uppercase prose-p:font-light prose-p:leading-relaxed prose-a:text-safety-orange focus:outline-none">
                        {/* Video Section */}
                        {getVideoUrl(article) && (
                            <div className="mb-12 not-prose">
                                <VideoPlayer
                                    url={getVideoUrl(article) || ''}
                                    title={article.title}
                                    poster={getImageUrl(article) || undefined}
                                />
                                <div className="mt-2 text-xs font-mono text-muted-foreground uppercase flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-safety-orange animate-pulse" />
                                    VIDEO_SOURCE_ACTIVE // 4K_READY
                                </div>
                            </div>
                        )}

                        {article.content?.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-6 indent-8 text-gray-300">
                                {paragraph}
                            </p>
                        ))}
                    </article>

                    <div className="mt-16 pt-8 border-t border-industrial-border">
                        <h3 className="text-xs font-mono uppercase text-muted-foreground mb-4">[ Метки ]</h3>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-industrial-panel border border-industrial-border text-xs">INDUSTRY 4.0</span>
                            <span className="px-2 py-1 bg-industrial-panel border border-industrial-border text-xs">TECH</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
