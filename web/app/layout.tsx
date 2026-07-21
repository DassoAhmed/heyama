import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '@/context/SocketContext'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Heyama Objects',
  description: 'Manage your objects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </ToastProvider>
      </body>
    </html>
  )
}