import { Skeleton } from "@/components/ui/skeleton";

export default function PassportLoading() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header Skeleton */}
            <div className="bg-industrial-surface border-b border-white/5 pt-24 pb-8">
                <div className="container mx-auto px-6">
                    <Skeleton className="h-4 w-32 bg-white/10 mb-4" />
                    <Skeleton className="h-12 w-64 bg-white/10 mb-2" />
                    <Skeleton className="h-4 w-48 bg-white/10" />
                </div>
            </div>

            <main className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Skeleton className="h-80 bg-white/5" />
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-24 bg-white/5" />
                            <Skeleton className="h-24 bg-white/5" />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 space-y-8">
                        <Skeleton className="h-64 bg-white/5" />
                        <div className="grid grid-cols-3 gap-6">
                            <Skeleton className="h-32 bg-white/5" />
                            <Skeleton className="h-32 bg-white/5" />
                            <Skeleton className="h-32 bg-white/5" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
