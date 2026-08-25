import type { Metadata } from 'next'
import '@livekit/components-styles'
import './globals.css'

export const metadata: Metadata = {
  title: 'Live Meeting',
  description: 'LiveKit room audio conferencing POC',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
