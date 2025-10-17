'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminCustomNav() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handleImportClick = () => {
    router.push('/admin/import')
  }

  return (
    <div className="mb-5">
      <button
        onClick={handleImportClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: isHovered ? '#0056b3' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
        Import Alumni
      </button>
    </div>
  )
}
