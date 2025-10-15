'use client'

import { useState, useEffect, useCallback } from 'react' // ✅ Import useCallback
import Link from 'next/link'
import Image from 'next/image'
import AlumniFilter from '@/components/alumni/AlumniFilter'
import { useAuth } from '@/lib/useAuth'

interface Alumni {
  id: string
  name: string
  batch: number
  currentStatus: string
  institution?: string
  position?: string
  location?: {
    city?: string
    country?: string
  }
  photo?: {
    url: string
    alt: string
  }
}

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [batches, setBatches] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [institutions, setInstitutions] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false) // ✅ Track initialization

  const { authenticated, user, loading: authLoading } = useAuth()

  // ✅ PERBAIKAN: Stabilkan fetchFilterOptions dengan useCallback
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/alumni/filter')
      if (response.ok) {
        const data = await response.json()
        const alumniData: Alumni[] = data.alumni || []

        const batchNumbers = alumniData
          .map((a) => a.batch)
          .filter((batch): batch is number => typeof batch === 'number')

        const cityNames = alumniData
          .map((a) => a.location?.city)
          .filter((city): city is string => typeof city === 'string' && city.trim() !== '')

        const institutionNames = alumniData
          .map((a) => a.institution)
          .filter(
            (institution): institution is string =>
              typeof institution === 'string' && institution.trim() !== '',
          )

        const positionNames = alumniData
          .map((a) => a.position)
          .filter(
            (position): position is string =>
              typeof position === 'string' && position.trim() !== '',
          )

        const uniqueBatches = [...new Set(batchNumbers)]
          .map(String)
          .sort((a, b) => parseInt(b) - parseInt(a))
        const uniqueCities = [...new Set(cityNames)].sort()
        const uniqueInstitutions = [...new Set(institutionNames)].sort()
        const uniquePositions = [...new Set(positionNames)].sort()

        setBatches(uniqueBatches)
        setCities(uniqueCities)
        setInstitutions(uniqueInstitutions)
        setPositions(uniquePositions)
      }
    } catch (err) {
      console.warn('Could not fetch filter options:', err)
    }
  }, [])

  // ✅ PERBAIKAN: Stabilkan fetchAlumni dengan useCallback
  const fetchAlumni = useCallback(
    async (filters = {}) => {
      // ✅ Jangan set loading jika hanya filter change
      if (!initialized) {
        setLoading(true)
      }

      try {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== ''),
        )

        const params = new URLSearchParams(cleanFilters as Record<string, string>)
        const response = await fetch(`/api/alumni/filter?${params}`)

        if (response.ok) {
          const data = await response.json()
          setAlumni(data.alumni || [])
          setError('')
        } else {
          setError('Gagal memuat data alumni')
        }
      } catch (err) {
        console.error('Error fetching alumni:', err)
        setError('Terjadi kesalahan saat memuat data')
      } finally {
        if (!initialized) {
          setLoading(false)
          setInitialized(true) // ✅ Mark as initialized
        }
      }
    },
    [initialized],
  )

  // ✅ PERBAIKAN: Hanya run sekali saat mount
  useEffect(() => {
    if (!initialized) {
      const initializeData = async () => {
        await fetchFilterOptions()
        await fetchAlumni()
      }

      initializeData()
    }
  }, [initialized, fetchFilterOptions, fetchAlumni])

  // ✅ Show loading hanya saat initial load
  if ((loading && !initialized) || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Direktori Alumni</h1>

          <div className="space-x-4">
            {authenticated ? (
              <>
                <span className="text-gray-700">Halo, {user?.name || user?.email}</span>
                <Link
                  href="/alumni/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                      })
                      window.location.href = '/' // ✅ Better redirect
                    } catch (error) {
                      console.error('Logout error:', error)
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/alumni/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ✅ AlumniFilter dengan stable function */}
        <AlumniFilter
          onFilterChange={fetchAlumni}
          batches={batches}
          cities={cities}
          institutions={institutions}
          positions={positions}
          loading={false} // ✅ Jangan pass loading state untuk filter
        />

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                {person.photo?.url ? (
                  <Image
                    src={person.photo.url}
                    alt={person.photo.alt}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-lg font-semibold">
                      {person.name.charAt(0)}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                  <p className="text-gray-600">Angkatan {person.batch}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {person.position && person.institution && (
                  <p className="text-sm text-gray-700">
                    {person.position} di {person.institution}
                  </p>
                )}

                {person.location?.city && (
                  <p className="text-sm text-gray-600">
                    📍 {person.location.city}, {person.location.country || 'Indonesia'}
                  </p>
                )}

                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {person.currentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>

        {alumni.length === 0 && initialized && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada data alumni yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
