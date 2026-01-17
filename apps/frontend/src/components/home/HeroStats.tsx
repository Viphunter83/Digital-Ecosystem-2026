import { motion } from "framer-motion";

const STATS = [
    { value: "12", label: "Лет на рынке", suffix: "" },
    { value: "4", label: "Производственных площадки", suffix: "" },
    { value: "15 000", label: "Производственных площадей", suffix: "м²" },
    { value: "200", label: "Специалистов в штате", suffix: "+" },
];

export function HeroStats() {
    return (
        <div className="w-full border-t border-white/10 bg-black/20 backdrop-blur-sm mt-8 lg:mt-0 lg:absolute lg:bottom-0 lg:left-0 lg:w-full z-20">
            <div className="container mx-auto px-6 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1), duration: 0.5 }}
                            className="flex flex-col relative group"
                        >
                            <div className="absolute top-0 left-0 w-8 h-[2px] bg-white/10 group-hover:bg-safety-orange transition-colors" />
                            <div className="text-3xl md:text-4xl font-black text-white font-mono mt-3 mb-1">
                                {stat.value}<span className="text-safety-orange text-2xl">{stat.suffix}</span>
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
