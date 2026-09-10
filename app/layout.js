import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Kontribute',
  description: 'Ask for it. Get it.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black min-h-screen">
        {children}
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
