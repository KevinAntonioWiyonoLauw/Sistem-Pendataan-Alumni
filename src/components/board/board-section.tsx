'use client'

import type { BoardMember } from '@/types/organization'
import BoardMemberCard from './board-member-card'

interface BoardSectionProps {
  title: string
  description?: string
  members: BoardMember[]
  variant?: 'featured' | 'default'
}

export default function BoardSection({
  title,
  description,
  members,
  variant = 'default',
}: BoardSectionProps) {
  if (members.length === 0) return null

  const isFeatured = variant === 'featured'

  return (
    <section className="mb-10 sm:mb-12">
      {/* Section Header */}
      <div className="mb-5 sm:mb-6 text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h3>
        {description && <p className="text-gray-500 mt-1.5 text-sm sm:text-base">{description}</p>}
        <div className="mt-3 h-1 w-16 bg-ugm-yellow rounded-full mx-auto" />
      </div>

      {/* Members Grid */}
      <div
        className={`
          flex flex-wrap justify-center gap-4 sm:gap-5
          ${isFeatured ? 'max-w-sm mx-auto' : ''}
        `}
      >
        {members.map((member) => (
          <div
            key={member.id}
            className={`
              w-full
              ${isFeatured ? '' : 'sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]'}
            `}
          >
            <BoardMemberCard member={member} variant={variant} />
          </div>
        ))}
      </div>
    </section>
  )
}
