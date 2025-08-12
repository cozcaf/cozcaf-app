import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cozcaf',
  description: 'Experience the perfect blend of premium coffee, delicious broast chicken, gourmet burgers, and cozy atmosphere. Where every meal and every moment matters.',
  generator: 'v0.dev',
  openGraph: {
    title: "Cozcaf",
    description: "Bulk Messaging for WhatsApp",
    images: ['https://cozcaf.github.io/assets/cozcaf-logo.png'], //['https://taxherohq.com/images/logo.svg'],
    url: 'https://cozcaf-app.vercel.app/'
  },
  icons: {
    icon: '/images/cozcaf-logo.png',
    shortcut: '/images/cozcaf-logo.png',
    apple: '/images/cozcaf-logo.png'
  },
  twitter: {
    card: 'summary_large_image',
    title: "Cozcaf",
    description: "Experience the perfect blend of premium coffee, delicious broast chicken, gourmet burgers, and cozy atmosphere. Where every meal and every moment matters.",
    images: ['https://cozcaf.github.io/assets/cozcaf-logo.png'] //['https://taxherohq.com/images/logo.svg']
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
