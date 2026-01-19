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
    const [searchQuery, setSearchQuery] = useState("");

    async function loadData(query: string = "") {
        setLoading(true);
        try {
            const data = await fetchCatalog(query);
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch catalog:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleSearch = () => {
        loadData(searchQuery);
    };

    const filteredProducts = activeFilter === "ВСЕ"
        ? products
        : products.filter(p => {
            const cat = p.category || "";
            if (activeFilter === "МЕХАНООБРАБОТКА") {
                return ["Turning", "Milling", "Advanced Machining"].includes(cat);
            }
            if (activeFilter === "ПРОИЗВОДСТВО") {
                return ["Pressing", "Laser"].includes(cat);
            }
            if (activeFilter === "ОБОРУДОВАНИЕ") {
                return true; // Catch-all or specific? For now show all or specific items
            }
            return false;
        });

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

            {/* Filters & Search */}
            <div className="container mx-auto px-6 mb-12">
                <div className="flex flex-col md:flex-row gap-6 p-6 border-y border-industrial-border bg-industrial-panel/30 backdrop-blur-sm items-center">

                    {/* Search Input */}
                    <div className="flex-1 w-full relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-muted-foreground group-focus-within:text-safety-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="ПОИСК ПО НАЗВАНИЮ ИЛИ ОПИСАНИЮ (AI-POWERED)..."
                            className="w-full bg-industrial-surface border border-industrial-border text-white text-sm font-mono pl-10 pr-24 py-3 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all placeholder:text-muted-foreground/50 uppercase tracking-wider"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-2 bottom-2 px-4 bg-safety-orange/10 hover:bg-safety-orange/20 text-safety-orange text-xs font-bold uppercase tracking-wider transition-colors border border-safety-orange/20 hover:border-safety-orange/50"
                        >
                            Найти
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {["ВСЕ", "МЕХАНООБРАБОТКА", "ПРОИЗВОДСТВО", "ОБОРУДОВАНИЕ"].map((filter, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveFilter(filter)}
                                className={`text-xs font-mono px-4 py-3 border transition-all uppercase tracking-wider ${activeFilter === filter
                                    ? "bg-safety-orange text-white border-safety-orange"
                                    : "text-muted-foreground border-industrial-border hover:border-white hover:text-white"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
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
