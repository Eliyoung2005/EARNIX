import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Script from 'next/script';

export const metadata: Metadata = {
  title: "EARNIX | Where Luxury Meets Earnings",
  description: "EARNIX is the ultimate platform for SoftLife and Stress-free Earnings. Get paid for sponsored tasks, referrals, and daily logins.",
  keywords: "EARNIX, earnings, make money online, affiliate marketing, sponsored tasks, softlife",
  // Google AdSense verification meta tag placeholder
  other: {
    "google-adsense-account": "ca-pub-YOUR_ADSENSE_ID_HERE"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Google AdSense Script Placeholder */}
        <Script
          id="adsense-init"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID_HERE"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
