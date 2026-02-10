import { fetchProjects, fetchArticles, fetchCatalog, fetchSiteContent } from '@/lib/api';
import HomeClient from './HomeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "ТД РусСтанкоСбыт | Главная",
  description: "Торговый Дом РусСтанкоСбыт - ведущий центр промышленной модернизации. Поставка станков, сервис ЧПУ и цифровые решения для промышленности.",
  openGraph: {
    title: "ТД РусСтанкоСбыт | Цифровая Экосистема",
    description: "Комплексные поставки и обслуживание промышленного оборудования.",
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
      <HomeClient
        projects={projects}
        articles={articles}
        products={prod.results || []}
        siteContent={siteContent}
      />
    </>
  );
}
