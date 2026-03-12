import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

import type { Viewport } from 'next';
import pageMetaConfig from "@/config/page-meta.config";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });


export const metadata: Metadata = pageMetaConfig;

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f3f3f3] dark:bg-background`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
