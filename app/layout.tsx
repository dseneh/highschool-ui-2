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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f3f3f3] dark:bg-background overflow-hidden`}
      >
        {/* Initial loading splash — rendered server-side, visible before JS hydrates */}
        <div
          id="initial-loader"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/img/logo-light-streamline.png"
            alt="Loading…"
            width={48}
            height={48}
            className="initial-loader-light"
          />
          <img
            src="/img/logo-dark-streamline.png"
            alt="Loading…"
            width={48}
            height={48}
            className="initial-loader-dark"
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes pulse-icon {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.4; transform: scale(0.92); }
                }
                #initial-loader { background-color: #f3f3f3; }
                #initial-loader img { animation: pulse-icon 1.4s ease-in-out infinite; }
                .initial-loader-light { display: block; }
                .initial-loader-dark { display: none; }
                .dark #initial-loader { background-color: oklch(0.14 0.02 240); }
                .dark .initial-loader-light { display: none; }
                .dark .initial-loader-dark { display: block; }
              `,
            }}
          />
        </div>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
