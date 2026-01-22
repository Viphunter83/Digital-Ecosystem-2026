import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceLoading() {
    return (
        <div className="min-h-screen bg-transparent text-white">
            {/* Hero Skeleton */}
            <section className="relative py-20 overflow-hidden border-b border-white/5">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-4 w-48 bg-white/10 mb-6" />
                    <Skeleton className="h-16 w-3/4 bg-white/10 mb-4" />
                    <Skeleton className="h-6 w-1/2 bg-white/10" />
                </div>
            </section>

            <div className="container mx-auto py-12 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column Skeleton */}
                    <div className="lg:col-span-8 space-y-16">
                        <div className="space-y-8">
                            <Skeleton className="h-8 w-64 bg-white/10" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 bg-white/5" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="lg:col-span-4 space-y-8">
                        <Skeleton className="h-96 bg-white/5 rounded-lg" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 bg-white/5" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
