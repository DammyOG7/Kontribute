import './globals.css'

export const metadata = {
  title: 'Kontribute',
  description: 'Ask for it. Get it.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black min-h-screen">{children}</body>
    </html>
  )
}
