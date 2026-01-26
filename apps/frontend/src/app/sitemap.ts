import { MetadataRoute } from 'next'
import { fetchCatalog, fetchArticles } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://td-rss.ru'

    // Fetch all dynamic content
    const [productsResponse, articles] = await Promise.all([
        fetchCatalog(undefined, 'machines', 1000), // All machines
        fetchArticles(),
    ])

    const products = productsResponse.results || []

    // Static routes
    const staticRoutes = [
        '',
        '/catalog',
        '/journal',
        '/service',
        '/solutions',
        '/contacts',
        '/company',
        '/projects',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic products
    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/catalog/${product.slug || product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // Dynamic articles
    const articleRoutes = articles.map((article) => ({
        url: `${baseUrl}/journal/${article.slug || article.id}`,
        lastModified: new Date(article.published_at || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }))

    return [...staticRoutes, ...productRoutes, ...articleRoutes]
}
