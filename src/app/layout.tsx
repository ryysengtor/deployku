import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Craig Of the Creek - Digital Store",
  description: "Toko digital Cartoon Network style. Top up game, voucher, dan layanan digital. Pembayaran otomatis, cepat, aman!",
  keywords: ["toko digital", "top up game", "voucher digital", "cartoon network", "craig of the creek", "mobile legends", "free fire", "genshin impact", "pembayaran otomatis"],
  authors: [{ name: "Craig Of the Creek Store" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Craig Of the Creek - Digital Store",
    description: "Toko digital Cartoon Network style. Top up game, voucher, dan layanan digital. Pembayaran otomatis, cepat, aman!",
    url: "https://creekstore.id",
    siteName: "Craig Of the Creek",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Craig Of the Creek - Digital Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Craig Of the Creek - Digital Store",
    description: "Toko digital Cartoon Network style. Top up game, voucher, dan layanan digital.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
