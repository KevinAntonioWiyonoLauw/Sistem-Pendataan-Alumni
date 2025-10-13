'use client'
import { useRouter } from 'next/navigation'

export default function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('payload-token')
          sessionStorage.removeItem('payload-token')
        }

        router.push('/admin/login')
        window.location.href = '/admin/login'
      } else {
        console.error('Logout failed:', response.statusText)
        window.location.href = '/admin/login'
      }
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/admin/login'
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="logout-button"
      style={{
        background: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#c82333'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = '#dc3545'
      }}
    >
      Logout
    </button>
  )
}
