"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { ProductTable } from '@/components/ProductTable';
import { Product, fetchCatalog } from '@/lib/api';

export default function CatalogPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeFilter, setActiveFilter] = useState("ВСЕ");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const data = await fetchCatalog();
            setProducts(data);
            setLoading(false);
        }
        loadData();
    }, []);

    const filteredProducts = activeFilter === "ВСЕ"
        ? products
        : products.filter(p => p.category === activeFilter);

    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* Header */}
            <div className="container mx-auto px-6 mb-12">
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-industrial-border pb-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 text-white">
                            Каталог <span className="text-safety-orange">Оборудования</span>
                        </h1>
                        <p className="text-muted-foreground font-mono text-sm max-w-xl">
                            ВЫСОКОТЕХНОЛОГИЧНЫЕ РЕШЕНИЯ ДЛЯ ПРОМЫШЛЕННОСТИ. ПОЛНЫЙ СПЕКТР ОБОРУДОВАНИЯ.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-4 mt-4 md:mt-0">
                        <div className="font-mono text-xs text-safety-orange text-right">
                            <span className="mr-4">[ ВСЕГО ПОЗИЦИЙ: {products.length} ]</span>
                            <span>[ ОБНОВЛЕНО: 17.01.2026 ]</span>
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-industrial-panel border border-industrial-border p-1 gap-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-safety-orange text-white' : 'text-muted-foreground hover:text-white'}`}
                                title="Grid View"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-safety-orange text-white' : 'text-muted-foreground hover:text-white'}`}
                                title="Table View"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M1 2h14v2H1V2zm0 4h14v2H1V6zm0 4h14v2H1v-2zm0 4h14v2H1v-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="container mx-auto px-6 mb-12">
                <div className="flex flex-wrap gap-4 p-4 border-y border-industrial-border bg-industrial-panel/30 backdrop-blur-sm">
                    {["ВСЕ", "МЕХАНООБРАБОТКА", "ПРОИЗВОДСТВО", "ОБОРУДОВАНИЕ"].map((filter, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveFilter(filter)}
                            className={`text-xs font-mono px-4 py-2 border transition-all uppercase tracking-wider ${activeFilter === filter
                                ? "bg-safety-orange text-white border-safety-orange"
                                : "text-muted-foreground border-industrial-border hover:border-white hover:text-white"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6">
                {loading ? (
                    <div className="text-center py-20 font-mono text-safety-orange animate-pulse">
                        [ ЗАГРУЗКА БАЗЫ ДАННЫХ... ]
                    </div>
                ) : (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="flex flex-col">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ProductTable products={filteredProducts} />
                    )
                )}
            </div>
        </div>
    );
}
