import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digital Ecosystem 2026",
  description: "Advanced Industrial Engineering Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-industrial-surface text-foreground flex flex-col min-h-screen`} suppressHydrationWarning>
        <NavBar />
        <main className="flex-grow pt-[80px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
