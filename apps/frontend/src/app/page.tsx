import { NavBar } from "@/components/NavBar";
import { ProductCard } from "@/components/ProductCard";
import { TechnicalSpecTable } from "@/components/TechnicalSpecTable";
import { Button } from "@/components/ui/button";

export default function Home() {
  const demoSpecs = [
    { parameter: "Мощность шпинделя", value: "15 кВт" },
    { parameter: "Макс. диаметр обработки", value: "400 мм" },
    { parameter: "Точность позиционирования", value: "±0.005 мм" },
    { parameter: "Вес станка", value: "4500 кг" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <NavBar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <section className="mb-16 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-foreground">
            Промышленные решения <span className="text-accent">нового поколения</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Высокоточные станки с ЧПУ и автоматизированные линии для вашего производства.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-8">
              Перейти в каталог
            </Button>
            <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 font-bold px-8">
              Связаться с нами
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 px-6">
          <ProductCard
            title="Токарный центр TC-2026Gen"
            category="Токарные станки"
            price="5 400 000 ₽"
            specs={demoSpecs.slice(0, 2)}
          />
          <ProductCard
            title="Фрезерный станок VM-500"
            category="Фрезерные станки"
            price="7 200 000 ₽"
            specs={demoSpecs.slice(0, 2)}
          />
          <ProductCard
            title="Лазерная резка LazerCut X"
            category="Лазерное оборудование"
            price="On Request"
            specs={demoSpecs.slice(0, 2)}
          />
        </section>

        <section className="max-w-3xl mx-auto bg-card p-8 rounded-lg shadow-sm border border-border">
          <h2 className="text-3xl font-bold mb-6">Технические характеристики TC-2026Gen</h2>
          <TechnicalSpecTable specs={demoSpecs} />
        </section>
      </main>

      <footer className="bg-sidebar text-sidebar-foreground py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-70">© 2026 ТД «РусСтанкоСбыт». Digital Ecosystem.</p>
        </div>
      </footer>
    </div>
  );
}
