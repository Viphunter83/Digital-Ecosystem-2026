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
  title: "ТД РУССТАНКОСБЫТ | Цифровая Экосистема",
  description: "Ведущий поставщик передовых промышленных инженерных решений и систем автоматизации.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
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
