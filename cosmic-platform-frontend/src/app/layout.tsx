// app/layout.tsx - Updated with Video Background
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CosmicVideoBackground from '@/components/cosmic/CosmicVideoBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'COSMIC Platform - Every mind is a universe',
  description: 'Digital universe where thoughts become planets and connections form bridges',
  keywords: 'cosmic, platform, universe, thoughts, connections, community',
  authors: [{ name: 'COSMIC Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} cosmic-body`}>
        {/* Cosmic Video Background */}
        <CosmicVideoBackground
          videoSrc="/215018_tiny.mp4"  // Space video
          overlay={true}
          opacity={0.8}  // Increased for better visibility
          blur={false}
        />
        
        {/* Main Content */}
        <div className="cosmic-content relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}

// Additional CSS for content layering
const additionalStyles = `
/* Add to globals.css */
.cosmic-body {
  background: #0a0a0f;
  min-height: 100vh;
  position: relative;
}

.cosmic-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

/* Ensure all cosmic cards and components are above video */
.cosmic-card,
.cosmic-button,
.cosmic-input {
  position: relative;
  z-index: 2;
}

/* Enhance glass morphism effect over video */
.cosmic-card {
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(233, 69, 96, 0.3);
}
`;

export { additionalStyles };