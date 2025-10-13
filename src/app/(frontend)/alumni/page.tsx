import React from 'react'
import Link from 'next/link'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { Alumnus } from '@/payload-types' // Ganti dari 'Alumni' ke 'Alumnus'

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
    limit: 50,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Alumni Computer Science UGM</h1>
        <Link
          href="/alumni/register"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Daftar Alumni
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.docs.map(
          (
            alumnus: Alumnus, // Ganti type dari 'Alumni' ke 'Alumnus'
          ) => (
            <div key={alumnus.id} className="bg-white shadow-lg rounded-lg p-6">
              {alumnus.photo && typeof alumnus.photo === 'object' && alumnus.photo.url && (
                <img
                  src={alumnus.photo.url}
                  alt={alumnus.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              )}

              <h3 className="text-xl font-semibold text-center mb-2">{alumnus.name}</h3>

              <div className="text-center text-gray-600 mb-4">
                <p>Angkatan {alumnus.batch}</p>
                {alumnus.graduationYear && <p>Lulus {alumnus.graduationYear}</p>}
              </div>

              {alumnus.currentPosition && (
                <p className="text-center font-medium mb-2">{alumnus.currentPosition}</p>
              )}

              {alumnus.company && (
                <p className="text-center text-gray-700 mb-2">{alumnus.company}</p>
              )}

              {alumnus.location && (
                <p className="text-center text-gray-600 mb-4">
                  {alumnus.location.city}, {alumnus.location.country}
                </p>
              )}

              {alumnus.bio && <p className="text-sm text-gray-700 mb-4">{alumnus.bio}</p>}

              {alumnus.linkedin && (
                <div className="text-center">
                  <a
                    href={alumnus.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {alumni.docs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Belum ada alumni yang terdaftar.</p>
          <Link
            href="/alumni/register"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            Jadilah yang pertama mendaftar!
          </Link>
        </div>
      )}
    </div>
  )
}
