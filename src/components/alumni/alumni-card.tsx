import React from 'react'
import Image from 'next/image'
import { AlumniDisplay } from '@/types/alumni'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface AlumniCardProps {
  alumni: AlumniDisplay
}

export default function AlumniCard({ alumni }: AlumniCardProps) {
  const workFieldLabels: Record<string, string> = {
    akademisi: 'Akademisi',
    pemerintah: 'Pemerintah',
    'lembaga-pemerintah': 'Lembaga Pemerintah',
    wirausaha: 'Wirausaha',
    swasta: 'Swasta',
    konsultan: 'Konsultan',
    teknologi: 'Teknologi/IT',
    keuangan: 'Keuangan/Perbankan',
    media: 'Media/Komunikasi',
    kesehatan: 'Kesehatan',
    pendidikan: 'Pendidikan',
    nonprofit: 'Non-Profit/LSM',
    lainnya: 'Lainnya',
  }

  return (
    <Card
      className="bg-white border hover:shadow-lg transition-all duration-200 group"
      style={{
        borderColor: 'var(--ugm-border-subtle)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardHeader>
        {/* Profile Section */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {alumni.photo?.url ? (
              <Image
                src={alumni.photo.url}
                alt={`Foto profil ${alumni.name}`}
                width={56}
                height={56}
                className="rounded-full object-cover"
                style={{
                  border: '2px solid var(--ugm-bg-subtle)',
                }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, var(--ugm-blue), var(--ugm-blue-soft))`,
                  border: '2px solid var(--ugm-bg-subtle)',
                }}
              >
                <span className="text-white text-xl font-medium">
                  {alumni.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name & Batch */}
          <div className="flex-1 min-w-0">
            <CardTitle
              className="text-lg font-semibold group-hover:transition-colors truncate"
              style={{
                color: 'var(--ugm-text-main)',
              }}
            >
              {alumni.name}
            </CardTitle>
            <div className="flex items-center mt-3">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm"
                style={{
                  backgroundColor: 'var(--ugm-blue)',
                  color: 'white',
                }}
              >
                Angkatan {alumni.batch}
              </span>
            </div>
            {alumni.nim && (
              <CardDescription className="text-sm mt-3" style={{ color: 'var(--ugm-text-muted)' }}>
                NIM: {alumni.nim}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
