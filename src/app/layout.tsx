import type { Metadata } from 'next'
import '@livekit/components-styles'
import './globals.css'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Talkback System',
  description:
    'Two-way communication between Operator Managers and Operator Rooms',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn('dark font-sans', geist.variable)}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}
