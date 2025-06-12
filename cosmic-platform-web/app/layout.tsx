import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cosmic Platform',
  description: 'Every mind is a universe. Every share is a trace.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-cosmic-dark text-white">
        {children}
      </body>
    </html>
  )
}
