import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "EARNIX | SoftLife & Stress-free Earnings",
    template: "%s | EARNIX"
  },
  description: "EARNIX is the ultimate platform for SoftLife and Stress-free Earnings. Get paid for sponsored tasks and referrals.",
  keywords: ["EARNIX", "earnings", "make money online", "affiliate marketing", "sponsored tasks", "softlife"],
  metadataBase: new URL('https://earnix.online'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'EARNIX',
    images: ['/earnix-logo.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EARNIX | SoftLife & Stress-free Earnings',
    description: 'EARNIX is the ultimate platform for SoftLife and Stress-free Earnings. Get paid for sponsored tasks and referrals.',
    images: ['/earnix-logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
  alternates: { canonical: 'https://earnix.online' }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
