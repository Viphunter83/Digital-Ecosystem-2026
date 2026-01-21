"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { ProductTable } from '@/components/ProductTable';
import { Product, fetchCatalog, fetchFilters, FilterGroup } from '@/lib/api';

export default function CatalogPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'machines' | 'spares'>('machines');

    const [activeCategory, setActiveCategory] = useState<string | null>(null); // null = ALL
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination State
    const [limit, setLimit] = useState(40);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    // Dynamic Filters State
    const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

    async function loadData(
        query: string = "",
        type: 'machines' | 'spares' = activeTab,
        currentLimit: number = limit,
        currentOffset: number = 0,
        append: boolean = false,
        category: string | null = activeCategory
    ) {
        setLoading(true);
        try {
            const data = await fetchCatalog(query, type, currentLimit, currentOffset, category || undefined);
            if (append) {
                setProducts(prev => [...prev, ...data.results]);
            } else {
                setProducts(data.results);
            }
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch catalog:", error);
        } finally {
            setLoading(false);
        }
    }

    // Load Filters on Mount
    useEffect(() => {
        async function loadFilters() {
            const data = await fetchFilters();
            setFilterGroups(data.groups);
        }
        loadFilters();
    }, []);

    // Initial Load & Tab/Category Change
    useEffect(() => {
        setOffset(0);
        loadData(searchQuery, activeTab, limit, 0, false, activeCategory);
    }, [activeTab, limit, activeCategory]);

    const handleSearch = () => {
        setOffset(0);
        loadData(searchQuery, activeTab, limit, 0, false, activeCategory);
    };

    const handleLoadMore = () => {
        const newOffset = offset + limit;
        setOffset(newOffset);
        loadData(searchQuery, activeTab, limit, newOffset, true, activeCategory);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
    };

    const handleCategoryClick = (category: string | null) => {
        setActiveCategory(category);
        // useEffect handles reload
    };

    // Client-side Filter Logic (Only for Categories within loaded batch???)
    // WARNING: Client-side filtering on server-side paginated data is BROKEN UX.
    // If I fetch 20 items (mixed), and filter for "TURNING", I might get 0, even if page 2 has them.
    // The current filter logic relies on `filteredProducts`.
    // IF we move to server-side pagination, Filters MUST BE SERVER-SIDE (part of query).
    // The user didn't ask explicitly for fixing filters, but "Standardizing" implies it works.
    // The `fetchCatalog` API supports `q` and `type`. But `category`?
    // Backend `search_products` DOES NOT accept `category` param yet.
    // Current "ВСЕ" / "МЕХАНООБРАБОТКА" logic is entirely client-side.
    // Given the task "Pagination", I strictly should enable pagination.
    // If I break filters, that's bad.
    // However, if I implement server-side pagination, I MUST implement server-side filtering or fetch ALL and paginate locally.
    // User complaint: "Loading all items... load convenience".
    // If I fetch ALL and paginate locally, I solve the loading UI (rendering speed) but not data speed.
    // But data speed for 4000 items is fast (KB). Accessing 4000 DOM nodes is slow.
    // Client-side pagination ( Virtualization or Slice ) is safest for logic preservation.
    // Server-side pagination is "True" pagination.

    // DECISION: User asked for "Browser-like... 20, 60". 
    // I will implement CLIENT-SIDE pagination first because backend filters are missing.
    // BUT wait, I just implemented LIMIT/OFFSET in Backend.
    // If I use backend pagination, I break category filters unless I add `category_slug` to backend `search_products`.
    // I SHOULD add `category` to backend `search_products`. It's easy.
    // `category` is a column in Product.

    // For now, I will revert to Client-Side Pagination of the FETCHED list? 
    // No, that defeats the purpose of "loading time" if network is the bottleneck.
    // But actually, data transfer is fast. Rendering is slow.
    // Let's implement SERVER-SIDE pagination and simply Disable category filters for now? No, checking logic.
    // `activeFilter` logic: `filterGroups`...
    // I'll assume for this step I implement Server-Side Pagination, and if Filters break, I'll fix them in next step (Backend Category Filter).
    // Actually, I'll stick to `filteredProducts` being the displayed list.
    // Usage: `filteredProducts` is derived from `products`.
    // If `products` is only 20 items, filtering it is useless.

    // I will modify this to use CLIENT-SIDE filtering IF `activeFilter !== "ВСЕ"`, 
    // OR... I can just pass `activeFilter` to backend if I quickly patch backend.

    // Let's implement UI pagination first in `page.tsx` using the `products` state which IS paginated from server.
    // I will comment out the client-side filter logic and rely on `activeFilter` triggering a reload if I can patch backend.
    // If I can't patch backend now, I'll leave filters broken/client-side-only-on-current-page (which is standard behavior for "table filters" sometimes).

    // Wait, I can pass `activeFilter` as `q`? No.
    // Let's implement the UI. The user just asked for "Pagination".

    const filteredProducts = products; // Direct use for now, assumes Server filtering in future step or current page filtering.

    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* Header ... same ... */}
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
                            <span className="mr-4 text-white/50">ОТОБРАЖЕНО: {products.length} ИЗ {total}</span>
                        </div>

                        {/* View Toggle & Limit Selector */}
                        <div className="flex items-center gap-4">
                            {/* Limit Selector */}
                            <div className="flex items-center bg-industrial-panel border border-industrial-border p-1">
                                {[20, 40, 60].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => handleLimitChange(val)}
                                        className={`px-3 py-1 text-xs font-mono transition-colors ${limit === val ? 'bg-safety-orange text-white' : 'text-muted-foreground hover:text-white'}`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>

                            <div className="flex bg-industrial-panel border border-industrial-border p-1 gap-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-safety-orange text-white' : 'text-muted-foreground hover:text-white'}`}
                                >
                                    <div className="w-4 h-4 flex flex-wrap gap-0.5 justify-center content-center">
                                        <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
                                        <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
                                        <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
                                        <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
                                    </div>
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-safety-orange text-white' : 'text-muted-foreground hover:text-white'}`}
                                >
                                    <div className="w-4 h-4 flex flex-col gap-0.5 justify-center content-center">
                                        <div className="w-full h-0.5 bg-current rounded-[1px]" />
                                        <div className="w-full h-0.5 bg-current rounded-[1px]" />
                                        <div className="w-full h-0.5 bg-current rounded-[1px]" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search - Keeping UI but logic needs server update for filters */}
            <div className="container mx-auto px-6 mb-12">
                {/* TABS */}
                <div className="flex gap-8 mb-6 border-b border-industrial-border">
                    <button
                        onClick={() => { if (activeTab !== 'machines') setActiveTab('machines'); }}
                        className={`text-lg font-black uppercase tracking-tighter pb-4 transition-colors ${activeTab === 'machines' ? 'border-b-2 border-safety-orange text-white' : 'text-muted-foreground hover:text-white'}`}
                    >
                        Оборудование
                    </button>
                    <button
                        onClick={() => { if (activeTab !== 'spares') setActiveTab('spares'); }}
                        className={`text-lg font-black uppercase tracking-tighter pb-4 transition-colors ${activeTab === 'spares' ? 'border-b-2 border-safety-orange text-white' : 'text-muted-foreground hover:text-white'}`}
                    >
                        Запчасти
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 p-6 border-y border-industrial-border bg-industrial-panel/30 backdrop-blur-sm items-center">
                    {/* Search Input */}
                    <div className="flex-1 w-full relative group">
                        <input
                            type="text"
                            placeholder="ПОИСК..."
                            className="w-full bg-industrial-surface border border-industrial-border text-white text-sm font-mono pl-4 pr-24 py-3 focus:outline-none focus:border-safety-orange focus:ring-1 focus:ring-safety-orange transition-all uppercase tracking-wider"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-2 bottom-2 px-4 bg-safety-orange/10 hover:bg-safety-orange/20 text-safety-orange text-xs font-bold uppercase tracking-wider transition-colors border border-safety-orange/20"
                        >
                            Найти
                        </button>
                    </div>

                    {/* Category Filters */}
                    {activeTab === 'machines' && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleCategoryClick(null)}
                                className={`text-xs font-mono px-4 py-3 border transition-all uppercase tracking-wider ${activeCategory === null ? "bg-safety-orange text-white border-safety-orange" : "text-muted-foreground border-industrial-border hover:border-white"}`}
                            >
                                ВСЕ
                            </button>
                            {['Turning', 'Milling', 'Drilling', 'Grinding', 'Pressing', 'Laser', 'CNC Machines', 'Other'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`text-xs font-mono px-4 py-3 border transition-all uppercase tracking-wider ${activeCategory === cat ? "bg-safety-orange text-white border-safety-orange" : "text-muted-foreground border-industrial-border hover:border-white"}`}
                                >
                                    {cat === 'Turning' ? 'ТОКАРНЫЙ' :
                                        cat === 'Milling' ? 'ФРЕЗЕРНЫЙ' :
                                            cat === 'Drilling' ? 'СВЕРЛИЛЬНЫЙ' :
                                                cat === 'Grinding' ? 'ШЛИФОВАЛЬНЫЙ' :
                                                    cat === 'Pressing' ? 'ПРЕСС' :
                                                        cat === 'Laser' ? 'ЛАЗЕРНЫЙ' :
                                                            cat === 'CNC Machines' ? 'ЧПУ' : 'ПРОЧЕЕ'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6">
                {loading && products.length === 0 ? (
                    <div className="text-center py-20 font-mono text-safety-orange animate-pulse">
                        [ ЗАГРУЗКА... ]
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div key={product.id} className="flex flex-col">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ProductTable products={products} />
                        )}

                        {/* Load More Button */}
                        {products.length < total && (
                            <div className="flex justify-center mt-12 mb-20">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="px-12 py-4 bg-industrial-panel border border-safety-orange text-safety-orange font-bold uppercase tracking-widest hover:bg-safety-orange hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                >
                                    {loading ? (
                                        <><span>ЗАГРУЗКА...</span></>
                                    ) : (
                                        <><span>ЗАГРУЗИТЬ ЕЩЕ ({total - products.length})</span></>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Space for aesthetic */}
                        <div className="h-12"></div>
                    </>
                )}
            </div>
        </div>
    );
}
