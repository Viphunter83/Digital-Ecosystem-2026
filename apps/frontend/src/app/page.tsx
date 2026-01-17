"use client";

import Image from "next/image";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { fetchProjects, fetchArticles, fetchCatalog, Project, Article, Product } from '@/lib/api';
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';
import { ProductCard } from "@/components/ProductCard";

// Dynamically import Map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function init() {
      const p = await fetchProjects();
      const a = await fetchArticles();
      const prod = await fetchCatalog();
      setProjects(p);
      setArticles(a);
      setProducts(prod);
    }
    init();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-industrial-surface text-foreground selection:bg-safety-orange selection:text-white">

      {/* HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-industrial-surface">
        {/* Dynamic Industrial Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-industrial-panel/50 via-industrial-surface to-black" />
        </div>

        <div className="container relative z-10 px-6 flex flex-col items-start justify-center h-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 inline-flex items-center gap-3 border-l-2 border-safety-orange pl-4"
          >
            <span className="text-sm font-mono tracking-[0.2em] uppercase text-safety-orange font-bold">Статус системы: Номинальный</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-8 text-white uppercase mix-blend-screen"
          >
            ИНЖИНИРИНГ<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">БУДУЩЕГО</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl font-light leading-relaxed border-t border-white/10 pt-8"
          >
            Передовая цифровая экосистема управления жизненным циклом.
            <span className="text-white font-medium"> Точность. Эффективность. Контроль.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <Link href="/catalog" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold h-16 px-10 text-lg rounded-none uppercase tracking-widest shadow-[0_0_40px_rgba(255,61,0,0.2)] hover:shadow-[0_0_60px_rgba(255,61,0,0.4)] transition-all flex items-center justify-between group">
                Оформить заказ
                <ArrowRight className="ml-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/solutions" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5 hover:border-white/40 text-white h-16 px-10 text-lg rounded-none uppercase tracking-widest backdrop-blur-sm font-mono">
                Диагностика системы
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 right-10 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground vertical-rl rotate-180">Листайте для просмотра</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-safety-orange to-transparent" />
        </motion.div>
      </section>

      {/* CATALOG PREVIEW SECTION */}
      <section className="py-32 bg-industrial-surface relative z-10 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-safety-orange rounded-full animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-safety-orange">Доступно к заказу</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Высокая производительность</h2>
            </div>
            <Link href="/catalog" className="hidden md:block group">
              <Button variant="link" className="text-muted-foreground group-hover:text-safety-orange text-sm uppercase font-mono tracking-widest transition-colors">
                Посмотреть весь каталог [➔]
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-industrial-border border border-industrial-border">
            {products.length > 0 ? (
              products.slice(0, 4).map(product => (
                <div key={product.id} className="h-full bg-industrial-panel">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-industrial-panel">
                <div className="flex flex-col items-center gap-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-safety-orange"></div>
                  <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">Загрузка активов...</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 md:hidden text-center">
            <Link href="/catalog">
              <Button variant="outline" className="w-full border-industrial-border hover:bg-industrial-panel uppercase font-mono tracking-widest text-xs h-12">
                Посмотреть полный каталог
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="py-0 relative">
        <div className="bg-industrial-panel border-y border-industrial-border py-4 px-6 flex justify-between items-center overflow-hidden">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className="text-2xl font-black uppercase italic text-industrial-surface text-stroke-1 opacity-20">
                Глобальная логистическая сеть // Доставка по всему миру // Поддержка 24/7
              </span>
            ))}
          </div>
        </div>

        <div className="relative h-[600px] w-full bg-deep-graphite grayscale invert-[0.1]">
          <MapComponent projects={projects} />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-industrial-surface to-transparent opacity-50" />
          <div className="absolute bottom-0 left-0 p-8 z-10">
            <h2 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Глобальный масштаб</h2>
            <div className="h-1 w-24 bg-safety-orange" />
          </div>
        </div>
      </section>

      {/* JOURNAL TEASER */}
      <section className="py-32 bg-industrial-surface">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">Инженерный журнал</h2>
            <span className="hidden md:block font-mono text-safety-orange text-xl">/// 2026.04</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(0, 3).map((article) => (
              <div key={article.id} className="group cursor-pointer flex flex-col h-full border border-transparent hover:border-white/10 p-4 -mx-4 transition-all hover:bg-white/5 rounded-none">
                <div className="relative aspect-[16/9] overflow-hidden mb-6 bg-industrial-panel border border-white/5 group-hover:border-safety-orange/50 transition-colors">
                  {article.image_url ? (
                    <Image src={article.image_url} alt={article.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
                      <span className="text-white/10 font-mono text-xs uppercase tracking-widest border border-white/10 px-2 py-1">Нет изображения</span>
                    </div>
                  )}
                  {/* Overlay Tag */}
                  <div className="absolute top-0 right-0 bg-white/90 text-black px-2 py-1 text-[10px] font-bold uppercase font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    Читать статью
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-safety-orange font-mono">:: Последнее обновление</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-safety-orange transition-colors leading-tight uppercase tracking-tight">{article.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 font-mono">{article.summary || article.content?.substring(0, 100)}...</p>
                </div>
              </div>
            ))}

            {articles.length === 0 && (
              <div className="col-span-3 py-10 text-center text-muted-foreground font-mono text-sm">
                [ЗАПИСИ ЖУРНАЛА НЕ НАЙДЕНЫ]
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
