import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { Alumnus } from '@/payload-types'

export default async function AlumniPage() {
  const payload = await getPayloadHMR({ config: configPromise })

  const alumni = await payload.find({
    collection: 'alumni',
    where: {
      isPublic: {
        equals: true,
      },
    },
    sort: '-batch',
    limit: 100,
  })

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      working: 'Bekerja',
      studying: 'Studi Lanjut',
      entrepreneur: 'Wirausaha',
      freelancer: 'Freelancer',
      'job-seeking': 'Mencari Kerja',
      other: 'Lainnya',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      working: 'bg-green-100 text-green-800',
      studying: 'bg-blue-100 text-blue-800',
      entrepreneur: 'bg-purple-100 text-purple-800',
      freelancer: 'bg-yellow-100 text-yellow-800',
      'job-seeking': 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Alumni Computer Science UGM</h1>
            <p className="text-gray-600">Total: {alumni.docs.length} alumni terdaftar</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alumni.docs.map((alumnus: Alumnus) => (
            <div
              key={alumnus.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
            >
              {alumnus.photo && typeof alumnus.photo === 'object' && alumnus.photo.url && (
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <Image
                    src={alumnus.photo.url}
                    alt={`Foto profil ${alumnus.name}`}
                    width={96}
                    height={96}
                    className="rounded-full object-cover border-4 border-gray-100"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    unoptimized
                    priority={false}
                  />
                </div>
              )}

              <h3 className="text-xl font-semibold text-center mb-2 text-gray-900">
                {alumnus.name}
              </h3>

              <div className="text-center mb-4">
                <p className="text-gray-600 font-medium">Angkatan {alumnus.batch}</p>
                {alumnus.currentStatus && (
                  <span
                    className={`inline-block text-sm px-3 py-1 rounded-full mt-2 ${getStatusColor(alumnus.currentStatus)}`}
                  >
                    {getStatusLabel(alumnus.currentStatus)}
                  </span>
                )}
              </div>

              {alumnus.position && (
                <p className="text-center font-medium mb-2 text-gray-800">{alumnus.position}</p>
              )}

              {alumnus.institution && (
                <p className="text-center text-gray-700 mb-2 text-sm">{alumnus.institution}</p>
              )}

              {alumnus.location && (alumnus.location.city || alumnus.location.country) && (
                <p className="text-center text-gray-600 mb-4 text-sm">
                  📍 {[alumnus.location.city, alumnus.location.country].filter(Boolean).join(', ')}
                </p>
              )}

              <div className="flex justify-center space-x-3">
                {alumnus.linkedin && (
                  <a
                    href={alumnus.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    LinkedIn
                  </a>
                )}
                {alumnus.website && (
                  <a
                    href={alumnus.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Website
                  </a>
                )}
                {alumnus.email && (
                  <a
                    href={`mailto:${alumnus.email}`}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Email
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {alumni.docs.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Belum ada alumni yang terdaftar
              </h2>
              <p className="text-gray-600 mb-6">
                Jadilah yang pertama untuk mendaftar sebagai alumni!
              </p>
              <Link
                href="/alumni/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block transition-colors"
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
