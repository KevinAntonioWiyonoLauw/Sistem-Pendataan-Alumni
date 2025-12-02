import React from 'react'
import '@/styles/global.css'
import '@/styles/theme.css'
import '@/styles/typography.css'
import Footer from '@/components/footer'

export const metadata = {
  description: 'Terhubung dengan sesama alumni Computer Science Universitas Gadjah Mada',
  title: 'Sistem Pendataan Alumni',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <main>{children}</main>
      </body>
      <Footer />
    </html>
  )
}
