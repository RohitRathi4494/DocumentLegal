import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Legal Document Engine',
  description: 'Dynamically generate legal documents with ease.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))]"></div>
        {children}
      </body>
    </html>
  )
}
