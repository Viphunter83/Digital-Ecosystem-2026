"use client";

import Image from "next/image";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { fetchProjects, fetchArticles, Project, Article } from '@/lib/api';
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';

// Dynamically import Map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function init() {
      const p = await fetchProjects();
      const a = await fetchArticles();
      setProjects(p);
      setArticles(a);
    }
    init();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">

      {/* HERO SECTION */}
      <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden bg-deep-graphite text-white">
        {/* Abstract Industrial Background */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-deep-graphite to-transparent" />

        <div className="container relative z-10 px-4 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight"
          >
            ИНЖИНИРИНГ <br /> <span className="text-safety-orange">ПОЛНОГО ЦИКЛА</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl"
          >
            От проектирования до сервисного обслуживания. Надежность, проверенная временем.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/catalog">
              <Button size="lg" className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold px-8 py-6 text-lg rounded-sm uppercase tracking-wider">
                Подобрать оборудование <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-wide">География поставок</h2>
              <p className="text-muted-foreground max-w-xl">Более 500 успешно реализованных проектов по всей России и СНГ.</p>
            </div>
          </div>
          <MapComponent projects={projects} />
        </div>
      </section>

      {/* JOURNAL TEASER */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 uppercase tracking-wide text-center">Журнал инженера</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length > 0 ? articles.slice(0, 3).map((article) => (
              <div key={article.id} className="group cursor-pointer">
                <div className="relative aspect-video overflow-hidden rounded-lg mb-4 bg-muted">
                  {article.image_url && (
                    <Image src={article.image_url} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-safety-orange transition-colors">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
              </div>
            )) : (
              // Mock teasers if no API data yet
              [1, 2, 3].map((_, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative aspect-video overflow-hidden rounded-lg mb-4 bg-deep-graphite/10">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono text-xs">NO ARTICLE DATa</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-safety-orange transition-colors">Модернизация турбинного цеха: Кейс {2024 + i}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">Обзор ключевых изменений в регламентах безопасности и эффективности...</p>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Link href="/journal">
              <Button variant="outline" className="border-deep-graphite hover:bg-deep-graphite hover:text-white uppercase tracking-wider font-bold">
                Читать все статьи
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
