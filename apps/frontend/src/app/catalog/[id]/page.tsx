import { Metadata } from 'next';
import { fetchProductById } from '@/lib/api';
import { ProductDetail } from '@/components/ProductDetail';
import Link from 'next/link';

type Props = {
    params: { id: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = params;
    const product = await fetchProductById(id);

    if (!product) {
        return {
            title: 'Товар не найден | Russtanko',
            description: 'Запрашиваемый товар не найден в каталоге.',
        };
    }

    const type = product.category ? 'Станок' : 'Запчасть';
    const title = `${product.name} | ${type} ${product.manufacturer || ''} | Купить в Russtanko`;
    const cleanDesc = (product.description || "").replace(/\s+/g, ' ').substring(0, 160);
    const description = cleanDesc || `Купить ${product.name} (${type}). Оригинальные запчасти и оборудование. Доставка по РФ.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: product.image_url ? [product.image_url] : [],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = params;
    const product = await fetchProductById(id);

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

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image_url,
        description: product.description,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: product.manufacturer || 'Russtanko'
        },
        offers: {
            '@type': 'Offer',
            url: `https://russtanko-eco.ru/catalog/${product.id}`,
            priceCurrency: 'RUB',
            price: product.price || '0',
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetail product={product} />
        </>
    );
}
