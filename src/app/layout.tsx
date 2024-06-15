import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import clsx from 'clsx'
import { Analytics } from '@vercel/analytics/react'

import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Use local version of Lexend so that we can use OpenType features
const lexend = localFont({
  src: '../fonts/lexend.woff2',
  display: 'swap',
  variable: '--font-lexend',
})

export const metadata: Metadata = {
  title: {
    template: '%s - Tork Workflow Engine',
    default: 'Tork - Open Source Workflow Engine',
  },
  description:
    'Creating workflows shouldn&apos;t be complicated or restricted to engineers; it should be available to everyone in the language they feel most comfortable with.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${clsx(
        'h-full antialiased',
        inter.variable,
        lexend.variable,
      )}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full bg-white dark:bg-slate-900">
        <Layout>{children}</Layout>
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
