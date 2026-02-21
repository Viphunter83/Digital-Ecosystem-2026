import { fetchProjects, fetchArticles, fetchCatalog, fetchSiteContent } from '@/lib/api';
import HomeClient from './HomeClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "ТД РусСтанкоСбыт — Станки с ЧПУ, Сервис и Модернизация Оборудования",
  description: "Торговый Дом РусСтанкоСбыт — ведущий центр промышленной модернизации. Поставка металлообрабатывающих станков, сервис ЧПУ и цифровые решения для промышленности 4.0.",
  alternates: {
    canonical: 'https://td-rss.ru',
  },
  openGraph: {
    title: "ТД РусСтанкоСбыт — Промышленная Экосистема",
    description: "Комплексные поставки, сервис и цифровизация промышленного оборудования.",
    url: 'https://td-rss.ru',
    siteName: 'ТД РусСтанкоСбыт',
    locale: 'ru_RU',
    type: 'website',
  }
};

export default async function Home() {
  const [projects, articles, prod, siteContent] = await Promise.all([
    fetchProjects(),
    fetchArticles(),
    fetchCatalog(),
    fetchSiteContent()
  ]);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ТД РусСтанкоСбыт",
    "url": "https://td-rss.ru",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://td-rss.ru/catalog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <h1 className="sr-only">ТД РусСтанкоСбыт — Промышленные инженерные решения и станки с ЧПУ</h1>
      <HomeClient
        projects={projects}
        articles={articles}
        products={prod.results || []}
        siteContent={siteContent}
      />
    </>
  );
}
