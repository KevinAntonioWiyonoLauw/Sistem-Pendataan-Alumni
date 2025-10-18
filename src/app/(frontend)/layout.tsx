import React from 'react'
import './global.css'

export const metadata = {
  description: 'Terhubung dengan sesama alumni Computer Science Universitas Gadjah Mada',
  title: 'Sistem Pendataan Alumni',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
