import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gemini Gli',
  description: 'Gemini CLI Desktop Application',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
