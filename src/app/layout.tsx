import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { CartDrawer } from '@/components/cart/CartDrawer';


const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});


export const metadata: Metadata = {
  title: 'FlexHub | Multi-Vendor Marketplace',
  description: 'Discover premium tech products from top vendors. Enterprise-grade multi-vendor marketplace with atomic stock reservations, split sub-orders, and secure payment integration.',
  keywords: ['e-commerce', 'multi-vendor', 'marketplace', 'nextjs', 'tailwind', 'prisma', 'razorpay', 'flexhub'],
  authors: [{ name: 'FlexHub Engineering' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f9f9ff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased selection:bg-[#d8e2ff] selection:text-[#001a42]">
        <AuthProvider>
          <CartProvider>
            <CartDrawer />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

