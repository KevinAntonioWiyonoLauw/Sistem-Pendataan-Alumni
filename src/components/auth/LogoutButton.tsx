'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

interface LogoutResponse {
  success: boolean
  message: string
}

export default function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result: LogoutResponse = await response.json()

      if (result.success) {
        // Hapus token dari localStorage jika ada
        localStorage.removeItem('alumni-token')

        // Redirect ke halaman utama
        router.push('/')
      } else {
        console.error('Logout failed:', result.message)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={
        className || 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50'
      }
    >
      {loading ? 'Logging out...' : children || 'Logout'}
    </button>
  )
}
