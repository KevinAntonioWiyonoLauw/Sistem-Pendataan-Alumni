'use client'

import type { BoardMember } from '@/types/organization'

interface BoardMemberCardProps {
  member: BoardMember
  variant?: 'featured' | 'default'
}

export default function BoardMemberCard({ member, variant = 'default' }: BoardMemberCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleStyles = (role: BoardMember['role']) => {
    switch (role) {
      case 'ketua':
        return {
          bg: 'bg-ugm-blue',
          text: 'text-ugm-light',
          border: 'border-ugm-blue',
          accent: 'bg-ugm-blue',
        }
      case 'wakil':
        return {
          bg: 'bg-ugm-blue-soft',
          text: 'text-white',
          border: 'border-ugm-blue-soft',
          accent: 'bg-ugm-blue-soft',
        }
      case 'sekretaris':
        return {
          bg: 'bg-ugm-blue-soft',
          text: 'text-white',
          border: 'border-ugm-blue-soft',
          accent: 'bg-ugm-blue-soft',
        }
      case 'bendahara':
        return {
          bg: 'bg-ugm-blue-soft',
          text: 'text-white',
          border: 'border-ugm-blue-soft',
          accent: 'bg-ugm-blue-soft',
        }
      default:
        return {
          bg: 'bg-ugm-blue',
          text: 'text-white',
          border: 'border-ugm-blue',
          accent: 'bg-ugm-blue',
        }
    }
  }

  const isFeatured = variant === 'featured'
  const styles = getRoleStyles(member.role)

  return (
    <article
      className={`
        group relative bg-white rounded-xl border-2 ${styles.border}
        shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden
      `}
    >
      {/* Top Accent Bar */}
      <div className={`h-1.5 ${styles.accent}`} />

      <div className={`p-5 sm:p-6 ${isFeatured ? 'sm:p-8' : ''}`}>
        {/* Avatar & Info */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div
            className={`
              relative flex-shrink-0 rounded-full flex items-center justify-center 
              shadow-lg group-hover:scale-110 transition-transform duration-300
              ${styles.bg} ${styles.text}
              ${isFeatured ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-14 h-14 sm:w-16 sm:h-16'}
            `}
            aria-hidden="true"
          >
            <span
              className={`font-bold tracking-wide ${isFeatured ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}`}
            >
              {getInitials(member.name)}
            </span>
          </div>

          {/* Name & Details */}
          <div className="mt-4">
            {/* Position Badge */}
            <span
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3
                ${styles.bg} ${styles.text}
              `}
            >
              {member.position}
            </span>

            {/* Name */}
            <h4
              className={`
                font-bold text-gray-900 group-hover:text-ugm-blue transition-colors duration-300 leading-tight
                ${isFeatured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}
              `}
            >
              {member.name}
            </h4>

            {/* Nickname - Jarak lebih dekat dengan nama */}
            {member.nickname && (
              <p className="text-gray-500 text-sm mt-4">&quot;{member.nickname}&quot;</p>
            )}

            {/* Batch - Jarak dari nickname/name */}
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs sm:text-sm font-medium">
                Angkatan {member.batch}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
