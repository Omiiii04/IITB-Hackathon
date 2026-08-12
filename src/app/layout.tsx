import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'MarketHub | Multi-Vendor E-Commerce Platform',
  description: 'Enterprise-grade multi-vendor e-commerce platform with atomic stock reservations, split sub-orders, and Razorpay payment integration.',
  keywords: ['e-commerce', 'multi-vendor', 'marketplace', 'nextjs', 'tailwind', 'prisma', 'razorpay'],
  authors: [{ name: 'MarketHub Engineering' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[#0f172a] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
