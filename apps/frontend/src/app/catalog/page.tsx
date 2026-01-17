"use client";

import { useEffect, useState } from 'react';
import { fetchCatalog, Product } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { motion } from 'framer-motion'; // Assuming we create this or simple debounce

export default function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Simple debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            loadProducts(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadProducts = async (query: string) => {
        setLoading(true);
        const data = await fetchCatalog(query);
        setProducts(data);
        setLoading(false);
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-8 uppercase tracking-widest text-deep-graphite dark:text-white">Smart Catalog</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filter Area (Static for now) */}
                <aside className="w-full lg:w-1/4 space-y-6">
                    <div className="bg-card p-6 rounded-lg border border-border">
                        <h3 className="font-bold mb-4 uppercase tracking-wider text-safety-orange">Категории</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2"><div className="w-4 h-4 border border-input rounded bg-primary" /> Все</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 border border-input rounded" /> Турбины</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 border border-input rounded" /> Котлы</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 border border-input rounded" /> Генераторы</div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск оборудования (Live Search)..."
                            className="pl-10 h-12 text-lg border-2 focus-visible:ring-safety-orange"
                        />
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 animate-pulse">
                            {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-muted rounded-xl" />)}
                        </div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                        >
                            {products.length > 0 ? (
                                products.map(product => (
                                    <motion.div
                                        key={product.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            show: { opacity: 1, y: 0 }
                                        }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-muted-foreground">
                                    Нет товаров по вашему запросу
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
