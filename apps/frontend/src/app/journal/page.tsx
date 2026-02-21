import { fetchArticles, fetchSiteContent, sanitizeUrl, getImageUrl } from '@/lib/api';
import Image from "next/image";
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Инженерный журнал | ТД РусСтанкоСбыт",
    description: "Статьи о промышленной модернизации, обслуживании станков с ЧПУ и цифровых решениях для производства.",
};

export default async function JournalArchivePage() {
    const articles = await fetchArticles();
    const siteContent = await fetchSiteContent();
    const articlesCount = articles?.length || 0;

    return (
        <div className="min-h-screen bg-industrial-surface pt-32 pb-24">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 border-b border-white/5 pb-8 gap-4">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
                        Инженерный журнал
                    </h1>
                    <span className="font-mono text-safety-orange text-sm md:text-xl tracking-widest uppercase">
                        Архив публикаций /// {articlesCount}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {articlesCount > 0 ? (
                        articles.map((article) => {
                            const aid = article.id;
                            const title = article.title;
                            const image_url = article.image_url;
                            const published_at = article.published_at;
                            const video_url = article.video_url;
                            const summary = article.summary || '';
                            const content = article.content || '';

                            let dateDisplay = 'Сборка 2026';
                            if (published_at) {
                                try {
                                    dateDisplay = new Date(published_at).toLocaleDateString('ru-RU');
                                } catch (e) {
                                    // Fallback
                                }
                            }

                            const safeImageUrl = getImageUrl(article) || "/images/journal-placeholder.jpg";
                            const description = summary || content.substring(0, 150);

                            return (
                                <Link
                                    href={`/journal/${aid}`}
                                    key={aid}
                                    className="group cursor-pointer flex flex-col h-full border border-transparent hover:border-white/10 p-4 -mx-4 transition-all hover:bg-white/5 rounded-none"
                                >
                                    <div className="relative aspect-[16/9] overflow-hidden mb-6 bg-industrial-panel border border-white/5 group-hover:border-safety-orange/50 transition-colors">
                                        {getImageUrl(article) ? (
                                            <Image
                                                src={safeImageUrl}
                                                alt={title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
                                                <span className="text-white/10 font-mono text-xs uppercase tracking-widest border border-white/10 px-2 py-1">Нет изображения</span>
                                            </div>
                                        )}
                                        <div className="absolute top-0 right-0 bg-white/90 text-black px-2 py-1 text-[10px] font-bold uppercase font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                            Читать статью
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-safety-orange/90 font-mono">
                                                :: {dateDisplay}
                                            </span>
                                            {video_url ? (
                                                <span className="text-[10px] bg-safety-orange/20 text-safety-orange px-1.5 py-0.5 font-mono ml-2">VIDEO_CONTENT</span>
                                            ) : null}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-safety-orange transition-colors leading-tight uppercase tracking-tight">
                                            {title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 font-mono">
                                            {description}...
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Детали [➔]</span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-32 text-center border border-dashed border-white/10">
                            <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
                                [ В ЖУРНАЛЕ ПОКА НЕТ ЗАПИСЕЙ ]
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
