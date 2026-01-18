"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Article, fetchArticleById } from '@/lib/api';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';

export default function ArticlePage() {
    const params = useParams();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (params.id) {
                const data = await fetchArticleById(params.id as string);
                if (data) setArticle(data);
            }
            setLoading(false);
        }
        load();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-industrial-surface flex items-center justify-center text-safety-orange font-mono">
                [ ЗАГРУЗКА МАТЕРИАЛА... ]
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-industrial-surface flex flex-col items-center justify-center text-white font-mono gap-4">
                <span>[ СТАТЬЯ НЕ НАЙДЕНА ]</span>
                <Link href="/" className="text-safety-orange hover:underline">[ ВЕРНУТЬСЯ НА ГЛАВНУЮ ]</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-industrial-surface text-white">
            <NavBar />

            {/* Hero Image */}
            <div className="relative w-full h-[60vh] mt-0">
                {article.image_url ? (
                    <Image
                        src={article.image_url}
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
                    <div className="prose prose-invert prose-lg prose-headings:font-black prose-headings:uppercase prose-p:font-light prose-p:leading-relaxed prose-a:text-safety-orange focus:outline-none">
                        {/* We are rendering plain text as content here, but in real app would use markdown renderer */}
                        {article.content?.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-6 indent-8 text-gray-300">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    <div className="mt-16 pt-8 border-t border-industrial-border">
                        <h3 className="text-xs font-mono uppercase text-muted-foreground mb-4">[ Метки ]</h3>
                        <div className="flex gap-2">
                            {/* Mock tags since they are in DB but API interface might need update to return them or we just skip */}
                            <span className="px-2 py-1 bg-industrial-panel border border-industrial-border text-xs">INDUSTRY 4.0</span>
                            <span className="px-2 py-1 bg-industrial-panel border border-industrial-border text-xs">TECH</span>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
