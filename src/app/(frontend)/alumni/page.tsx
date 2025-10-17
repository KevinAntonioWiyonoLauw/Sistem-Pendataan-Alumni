'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import AlumniFilter from '@/components/alumni/alumni-filter'
import { Alumni, AlumniDisplay, convertToDisplay } from '@/types/alumni'

// Filter options interface
interface FilterOptions {
  batch: string
  city: string
  workField: string
  currentEmployer: string
  position: string
  search: string
}

// Work field labels mapping
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

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<AlumniDisplay[]>([])
  const [batches, setBatches] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [workFields, setWorkFields] = useState<string[]>([])
  const [employers, setEmployers] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  // ✅ Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/alumni/filter')
      if (response.ok) {
        const data = await response.json()
        const alumniData: Alumni[] = data.alumni || []

        // Convert to display format for easier filtering
        const displayData = alumniData.map(convertToDisplay)

        // Extract unique values
        const uniqueBatches = [...new Set(displayData.map((a) => a.batch.toString()))].sort(
          (a, b) => parseInt(b) - parseInt(a),
        )

        const uniqueCities = [...new Set(displayData.map((a) => a.city))].filter(Boolean).sort()

        const uniqueWorkFields = [...new Set(displayData.flatMap((a) => a.workField || []))]
          .filter(Boolean)
          .sort()

        const uniqueEmployers = [...new Set(displayData.map((a) => a.currentEmployer))]
          .filter(Boolean)
          .sort()

        const uniquePositions = [...new Set(displayData.map((a) => a.position))]
          .filter(Boolean)
          .sort()

        setBatches(uniqueBatches)
        setCities(uniqueCities)
        setWorkFields(uniqueWorkFields)
        setEmployers(uniqueEmployers)
        setPositions(uniquePositions)
      }
    } catch (err) {
      console.warn('Could not fetch filter options:', err)
    }
  }, [])

  // ✅ Fetch alumni data
  const fetchAlumni = useCallback(
    async (filters: FilterOptions = {} as FilterOptions) => {
      if (!initialized) {
        setLoading(true)
      }

      try {
        // Build query parameters
        const params = new URLSearchParams()

        if (filters.batch) params.set('batch', filters.batch)
        if (filters.city) params.set('city', filters.city)
        if (filters.workField) params.set('workField', filters.workField)
        if (filters.currentEmployer) params.set('currentEmployer', filters.currentEmployer)
        if (filters.position) params.set('position', filters.position)
        if (filters.search) params.set('search', filters.search)

        const response = await fetch(`/api/alumni/filter?${params}`)

        if (response.ok) {
          const data = await response.json()
          const rawAlumni: Alumni[] = data.alumni || []

          // Convert to display format
          const displayAlumni = rawAlumni
            .filter((alumni) => alumni.metadata.isPublic) // Only show public profiles
            .map(convertToDisplay)

          setAlumni(displayAlumni)
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
          setInitialized(true)
        }
      }
    },
    [initialized],
  )

  // ✅ Initialize data
  useEffect(() => {
    if (!initialized) {
      const initializeData = async () => {
        await fetchFilterOptions()
        await fetchAlumni()
      }
      initializeData()
    }
  }, [initialized, fetchFilterOptions, fetchAlumni])

  // ✅ Loading state
  if (loading && !initialized) {
    return (
      <div className="h-screen  py-8 items-center flex justify-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data alumni...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Direktori Alumni Ilkom
          </h1>
          <p className=" text-center">
            Temukan dan hubungi alumni Ilmu Komputer
          </p>
        </div>

        {/* Filter Component */}
        <AlumniFilter
          onFilterChange={fetchAlumni}
          batches={batches}
          cities={cities}
          workFields={workFields}
          employers={employers}
          positions={positions}
        />

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 text-center">
          <p className="">
            Menampilkan <span className="font-semibold">{alumni.length}</span> alumni
          </p>
        </div>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((person) => (
            <div
              key={person.id}
              className="bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
            >
              {/* Profile Header */}
              <div className="flex items-start space-x-4 mb-4">
                {/* Avatar */}
                {person.photo?.url ? (
                  <Image
                    src={person.photo.url}
                    alt={person.photo.alt || person.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center border-2 border-gray-100">
                    <span className="text-white text-2xl font-bold">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Basic Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold truncate">{person.name}</h3>
                  <p className="text-blue-600 font-medium">Angkatan {person.batch}</p>
                  {person.nim && <p className="text-sm text-gray-500">NIM: {person.nim}</p>}
                </div>
              </div>

              {/* Work Info */}
              <div className="space-y-3">
                {/* Current Position */}
                <div className="bg-gray-500 rounded-lg p-3">
                  <p className="text-sm font-medium truncate">{person.position}</p>
                  <p className="text-sm text-gray-600 truncate">@ {person.currentEmployer}</p>
                </div>

                {/* Work Fields */}
                {person.workField && person.workField.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {person.workField.slice(0, 2).map((field, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {workFieldLabels[field] || field}
                      </span>
                    ))}
                    {person.workField.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{person.workField.length - 2} lainnya
                      </span>
                    )}
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center text-sm text-gray-100">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="truncate">
                    {person.city}, {person.country}
                  </span>
                </div>

                {/* Contact & Social */}
                <div className="flex items-center space-x-3 pt-2 border-t border-gray-100">
                  {/* Email */}
                  <a
                    href={`mailto:${person.email}`}
                    className="flex items-center text-sm text-gray-100 hover:text-red-600 transition-colors"
                    title="Email"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </a>

                  {/* Phone */}
                  <a
                    href={`https://wa.me/${person.phone.replace(/\D/g, '')}`}
                    className="flex items-center text-sm text-gray-100 hover:text-green-600 transition-colors"
                    title="WhatsApp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  {person.linkedin && (
                    <a
                      href={person.linkedin}
                      className="flex items-center text-sm text-gray-100 hover:text-blue-700 transition-colors"
                      title="LinkedIn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}

                  {/* Badges */}
                  <div className="flex space-x-1 ml-auto">
                    {person.contactPersonReady && (
                      <span
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                        title="Contact Person"
                      >
                        Contact Person
                      </span>
                    )}
                    {person.alumniOfficerReady && (
                      <span
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                        title="Pengurus Alumni"
                      >
                        Pengurus Alumni
                      </span>
                    )}
                  </div>
                </div>

                {/* Help Categories */}
                {person.willingToHelp && person.willingToHelp.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Bersedia membantu:</p>
                    <div className="flex flex-wrap gap-1">
                      {person.willingToHelp.slice(0, 2).map((help, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full"
                        >
                          {help.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      ))}
                      {person.willingToHelp.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{person.willingToHelp.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {alumni.length === 0 && initialized && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada alumni ditemukan</h3>
            <p className="text-gray-500">Coba ubah filter pencarian Anda</p>
          </div>
        )}
      </div>
    </div>
  )
}
