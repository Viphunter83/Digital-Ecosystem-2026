import { Metadata } from 'next';
import { fetchProductById, sanitizeUrl } from '@/lib/api';
import { ProductDetail } from '@/components/ProductDetail';
import Link from 'next/link';

const CATEGORY_RU: Record<string, string> = {
    'Turning': 'токарный станок',
    'Milling': 'фрезерный станок',
    'Drilling': 'сверлильный станок',
    'Grinding': 'шлифовальный станок',
    'Pressing': 'пресс',
    'Laser': 'лазерный станок',
    'CNC Machines': 'станок с ЧПУ',
    'Advanced Machining': 'обрабатывающий центр',
    'Other': 'промышленное оборудование',
};

type Props = {
    params: { slug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = params;
    const product = await fetchProductById(slug);

    if (!product) {
        return {
            title: 'Товар не найден | ТД РусСтанкоСбыт',
            description: 'Запрашиваемый товар не найден в каталоге.',
        };
    }

    const categoryRu = CATEGORY_RU[product.category || ''] || 'оборудование';
    const manufacturer = product.manufacturer || 'отечественного производства';

    const title = `${product.name} - купить ${categoryRu} | ТД РусСтанкоСбыт`;
    const cleanDesc = (product.description || "").replace(/\s+/g, ' ').substring(0, 150);
    const description = cleanDesc || `Купить ${product.name}. ${categoryRu.charAt(0).toUpperCase() + categoryRu.slice(1)} ${manufacturer}. Гарантия качества. Доставка по России.`;

    const keywords = [
        product.name,
        categoryRu,
        'купить станок',
        'промышленное оборудование',
        'станки б/у',
        'ТД РусСтанкоСбыт',
        product.manufacturer || '',
    ].filter(Boolean).join(', ');

    const productUrl = `https://td-rss.ru/catalog/${product.slug || product.id}`;
    const imageUrl = product.image_url?.startsWith('http')
        ? product.image_url
        : `https://td-rss.ru${product.image_url || '/images/products/product_cnc.png'}`;

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: productUrl,
        },
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            type: 'website',
            locale: 'ru_RU',
            url: productUrl,
            siteName: 'ТД РусСтанкоСбыт',
            title,
            description,
            images: [{
                url: imageUrl,
                width: 800,
                height: 600,
                alt: product.name,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = params;
    const product = await fetchProductById(slug);

    if (!product) {
        return (
            <div className="min-h-screen bg-industrial-surface flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">ТОВАР НЕ НАЙДЕН</h1>
                <Link href="/catalog" className="text-safety-orange hover:underline font-mono">
                    ВЕРНУТЬСЯ В КАТАЛОГ
                </Link>
            </div>
        );
    }

    // JSON-LD Structured Data for SEO
    const imageUrl = product.image_url?.startsWith('http')
        ? product.image_url
        : `https://td-rss.ru${product.image_url || '/images/products/product_cnc.png'}`;

    const jsonLd: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: imageUrl,
        description: product.description || `Промышленное оборудование ${product.name}`,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: product.manufacturer || 'ТД РусСтанкоСбыт'
        },
        offers: {
            '@type': 'Offer',
            url: `https://td-rss.ru/catalog/${product.slug || product.id}`,
            priceCurrency: 'RUB',
            price: product.price || undefined,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
                '@type': 'Organization',
                name: 'ТД РусСтанкоСбыт',
                url: 'https://td-rss.ru'
            }
        }
    };

    // Add Video Schema if exists
    if (product.video_url) {
        jsonLd.subjectOf = {
            '@type': 'VideoObject',
            name: `Обзор ${product.name}`,
            description: `Видеообзор оборудования ${product.name}`,
            thumbnailUrl: [imageUrl],
            uploadDate: new Date().toISOString(),
            contentUrl: sanitizeUrl(product.video_url),
            embedUrl: sanitizeUrl(product.video_url)
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
                name: 'Каталог',
                item: 'https://td-rss.ru/catalog'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: `https://td-rss.ru/catalog/${product.slug || product.id}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
            />
            <ProductDetail product={product} />
        </>
    );
}
