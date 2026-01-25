import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/cart/checkout'],
        },
        sitemap: 'https://td-rss.ru/sitemap.xml',
    }
}
