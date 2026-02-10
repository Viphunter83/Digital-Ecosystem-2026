import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { TelegramProvider } from "@/providers/TelegramProvider";
import { BottomNav } from "@/components/BottomNav";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://td-rss.ru"),
  title: {
    default: "ТД РУССТАНКОСБЫТ | Цифровая Экосистема Промышленного Оборудования",
    template: "%s | ТД РусСтанкоСбыт"
  },
  description: "Ведущий российский поставщик передовых станков, систем ЧПУ и инженерных решений. Интеллектуальный сервис и экосистема для промышленности 4.0.",
  keywords: ["промышленное оборудование", "станки с чпу", "русстанкосбыт", "инженерные решения", "автоматизация производства", "купить станок", "сервис ЧПУ"],
  authors: [{ name: "ТД РусСтанкоСбыт" }],
  creator: "ТД РусСтанкоСбыт",
  publisher: "ТД РусСтанкоСбыт",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://td-rss.ru",
    siteName: "ТД РусСтанкоСбыт",
    title: "ТД РусСтанкоСбыт | Промышленная Экосистема",
    description: "Продажа и обслуживание промышленного оборудования высокого класса. Цифровой контроль и сервис в одной платформе.",
    images: [
      {
        url: "/apple-icon.png",
        width: 1200,
        height: 630,
        alt: "ТД РусСтанкоСбыт",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ТД РусСтанкоСбыт | Промышленная Экосистема",
    description: "Цифровая платформа для выбора и обслуживания промышленного оборудования.",
    images: ["/apple-icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "yandex-metrika-id-placeholder", // Replace with real ID when available
    yandex: "yandex-verification-id-placeholder",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ТД РусСтанкоСбыт",
    "alternateName": "RUSSTANKOSBYT",
    "url": "https://td-rss.ru",
    "logo": "https://td-rss.ru/icon.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-499-390-85-04",
      "contactType": "sales",
      "areaServed": "RU",
      "availableLanguage": "Russian"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Берзарина, 36, стр. 2",
      "addressLocality": "Москва",
      "postalCode": "123060",
      "addressCountry": "RU"
    },
    "sameAs": [
      "https://t.me/Russtanko2026_bot"
    ]
  };

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased bg-industrial-surface text-foreground flex flex-col min-h-screen`} suppressHydrationWarning>
        <TelegramProvider>
          <NavBar />
          <main className="flex-grow pt-[80px]">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <Toaster richColors position="top-center" />
          <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        </TelegramProvider>
      </body>
    </html>
  );
}
