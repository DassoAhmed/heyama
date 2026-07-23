import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '@/context/SocketContext'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Heyama Objects',
  description: 'Manage your objects with real-time updates',
  applicationName: 'Heyama',
  authors: [{ name: 'Your Name' }],
  keywords: ['objects', 'management', 'real-time', 'heyama'],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Heyama Objects',
    description: 'Manage your objects with real-time updates',
    type: 'website',
    url: 'https://heyama-liard.vercel.app',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#007aff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#007aff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        {/* Add fallback styles for mobile */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              min-height: 100vh;
              min-height: -webkit-fill-available;
            }
            #__next {
              min-height: 100vh;
              min-height: -webkit-fill-available;
              display: flex;
              flex-direction: column;
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <SocketProvider>
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </SocketProvider>
        </ToastProvider>
      </body>
    </html>
  )
}