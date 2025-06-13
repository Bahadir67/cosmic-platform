// src/app/layout.tsx - Root Layout with Auth Context
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'COSMIC Platform - Your Digital Universe',
  description: 'Every mind is a universe. Every share is a trace.',
  keywords: ['cosmic', 'platform', 'universe', 'content', 'community'],
  authors: [{ name: 'COSMIC Platform Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#e94560',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-cosmic-void text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}