'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AlumniFilter from '@/components/alumni/alumni-filter'
import { Alumni, AlumniDisplay, convertToDisplay } from '@/types/alumni'

interface FilterOptions {
  batch: string
  city: string
  workField: string
  currentEmployer: string
  position: string
  search: string
}

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
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniDisplay[]>([]) // ✅ New state for filtered data
  const [batches, setBatches] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [workFields, setWorkFields] = useState<string[]>([])
  const [employers, setEmployers] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ✅ Simple filter states for non-authenticated users
  const [searchName, setSearchName] = useState('')
  const [filterBatch, setFilterBatch] = useState('')

  // ✅ Fetch filter options - only when authenticated
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/alumni/filter')
      if (response.ok) {
        const data = await response.json()

        setIsAuthenticated(data.isAuthenticated || false)

        // Only build filter options if authenticated
        if (data.isAuthenticated) {
          const alumniData: Alumni[] = data.alumni || []
          const displayData = alumniData.map(convertToDisplay)

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

          console.log('📥 Received data:', data)

          setIsAuthenticated(data.isAuthenticated || false)

          const rawAlumni: Alumni[] = data.alumni || []

          console.log('📊 Raw alumni count:', rawAlumni.length)

          const displayAlumni = rawAlumni.map(convertToDisplay)

          console.log('✅ Converted alumni count:', displayAlumni.length)

          setAlumni(displayAlumni)
          setFilteredAlumni(displayAlumni) // ✅ Set filtered data initially
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

  // ✅ Simple filter function for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated && alumni.length > 0) {
      let filtered = [...alumni]

      // Filter by name
      if (searchName.trim()) {
        filtered = filtered.filter((person) =>
          person.name.toLowerCase().includes(searchName.toLowerCase().trim()),
        )
      }

      // Filter by batch
      if (filterBatch) {
        filtered = filtered.filter((person) => person.batch.toString() === filterBatch)
      }

      setFilteredAlumni(filtered)
    } else {
      setFilteredAlumni(alumni)
    }
  }, [searchName, filterBatch, alumni, isAuthenticated])

  // ✅ Get unique batches for simple filter
  const availableBatches = [...new Set(alumni.map((a) => a.batch.toString()))].sort(
    (a, b) => parseInt(b) - parseInt(a),
  )

  // ✅ Reset simple filters
  const handleResetSimpleFilters = () => {
    setSearchName('')
    setFilterBatch('')
  }

  useEffect(() => {
    if (!initialized) {
      const initializeData = async () => {
        await fetchFilterOptions()
        await fetchAlumni()
      }
      initializeData()
    }
  }, [initialized, fetchFilterOptions, fetchAlumni])

  if (loading && !initialized) {
    return (
      <div className="h-screen py-8 items-center flex justify-center" suppressHydrationWarning>
        <div
          className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center"
          suppressHydrationWarning
        >
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"
            suppressHydrationWarning
          ></div>
          <p className="mt-4 text-gray-600">Memuat data alumni...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 bg-gray-900" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4" suppressHydrationWarning>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white text-center mb-2">Direktori Alumni Ilkom</h1>
          <p className="text-center text-gray-300">Temukan dan hubungi alumni Ilmu Komputer</p>
        </div>

        {!isAuthenticated && (
          <div
            className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center border border-blue-500 shadow-xl"
            suppressHydrationWarning
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Belum Terdaftar di Direktori Alumni?
            </h3>
            <p className="text-blue-100 mb-4">
              Isi survey untuk bergabung dengan jaringan alumni Ilmu Komputer UGM
            </p>
            <Link
              href="/alumni/survey-alumni-ilmu-komputer"
              className="inline-flex items-center px-8 py-3 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Isi Survey Sekarang
            </Link>
          </div>
        )}

        {/* ✅ Simple Filter for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div
            className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700"
            suppressHydrationWarning
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" suppressHydrationWarning>
              {/* Search by Name */}
              <div suppressHydrationWarning>
                <label
                  htmlFor="searchName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Cari Nama
                </label>
                <input
                  type="text"
                  id="searchName"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Masukkan nama..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter by Batch */}
              <div suppressHydrationWarning>
                <label
                  htmlFor="filterBatch"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Filter Angkatan
                </label>
                <select
                  id="filterBatch"
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Angkatan</option>
                  {availableBatches.map((batch) => (
                    <option key={batch} value={batch}>
                      Angkatan {batch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end" suppressHydrationWarning>
                <button
                  onClick={handleResetSimpleFilters}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 border border-gray-600"
                >
                  Reset Filter
                </button>
              </div>
            </div>

            {/* Filter Info */}
            {(searchName || filterBatch) && (
              <div
                className="mt-4 flex items-center text-sm text-gray-400"
                suppressHydrationWarning
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Filter aktif: {searchName && `Nama: "${searchName}"`}
                  {searchName && filterBatch && ' • '}
                  {filterBatch && `Angkatan: ${filterBatch}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ✅ Advanced Filter Component - Only for authenticated users */}
        {isAuthenticated && (
          <AlumniFilter
            onFilterChange={fetchAlumni}
            batches={batches}
            cities={cities}
            workFields={workFields}
            employers={employers}
            positions={positions}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 text-center">
          <p className="text-gray-300">
            Menampilkan <span className="font-semibold text-white">{filteredAlumni.length}</span>{' '}
            {!isAuthenticated && alumni.length !== filteredAlumni.length && (
              <span>dari {alumni.length}</span>
            )}{' '}
            alumni
          </p>
        </div>

        {/* Alumni Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          suppressHydrationWarning
        >
          {filteredAlumni.map((person) => (
            <div
              key={person.id}
              className="bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-700"
              suppressHydrationWarning
            >
              {/* Simplified Profile Display */}
              <div className="text-center" suppressHydrationWarning>
                {person.photo?.url ? (
                  <Image
                    src={person.photo.url}
                    alt={person.photo.alt || person.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-4 border-gray-700 mx-auto mb-4"
                  />
                ) : (
                  <div
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-gray-700 mx-auto mb-4"
                    suppressHydrationWarning
                  >
                    <span className="text-white text-2xl font-bold">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-semibold text-white mb-1">{person.name}</h3>
                <p className="text-blue-400 font-medium mb-1">Angkatan {person.batch}</p>
                {person.nim && <p className="text-sm text-gray-400">NIM: {person.nim}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAlumni.length === 0 && initialized && (
          <div className="text-center py-12" suppressHydrationWarning>
            <div
              className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700"
              suppressHydrationWarning
            >
              <svg
                className="w-12 h-12 text-gray-500"
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
            <h3 className="text-lg font-medium text-white mb-2">Tidak ada alumni ditemukan</h3>
            <p className="text-gray-400">
              {isAuthenticated
                ? 'Coba ubah filter pencarian Anda'
                : searchName || filterBatch
                  ? 'Tidak ada alumni yang sesuai dengan kriteria filter'
                  : 'Belum ada data alumni'}
            </p>
            {!isAuthenticated && (searchName || filterBatch) && (
              <button
                onClick={handleResetSimpleFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
