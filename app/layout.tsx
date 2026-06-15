import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../app/globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cloudz Travels - Intern CRM',
  description: 'Manage your interns efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}