'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Alumni, AlumniDisplay, convertToDisplay } from '@/types/alumni'
import AlumniCard from '@/components/alumni/alumni-card'

interface FilterOptions {
  batch: string
  city: string
  workField: string
  currentEmployer: string
  position: string
  search: string
}

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<AlumniDisplay[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  const [searchName, setSearchName] = useState('')
  const [filterBatch, setFilterBatch] = useState('')

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
          const rawAlumni: Alumni[] = data.alumni || []
          const displayAlumni = rawAlumni.map(convertToDisplay)

          setAlumni(displayAlumni)
          setFilteredAlumni(displayAlumni)
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

  useEffect(() => {
    let filtered = [...alumni]

    if (searchName.trim()) {
      filtered = filtered.filter((person) =>
        person.name.toLowerCase().includes(searchName.toLowerCase().trim()),
      )
    }

    if (filterBatch) {
      filtered = filtered.filter((person) => person.batch.toString() === filterBatch)
    }

    setFilteredAlumni(filtered)
  }, [searchName, filterBatch, alumni])

  const availableBatches = [...new Set(alumni.map((a) => a.batch.toString()))].sort(
    (a, b) => parseInt(b) - parseInt(a),
  )

  const handleResetSimpleFilters = () => {
    setSearchName('')
    setFilterBatch('')
  }

  useEffect(() => {
    if (!initialized) {
      fetchAlumni()
    }
  }, [initialized, fetchAlumni])

  if (loading && !initialized) {
    return (
      <div className="min-h-screen py-8 items-center flex justify-center bg-ugm-bg-light">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ugm-blue mx-auto"></div>
          <p className="mt-4 text-ugm-main font-medium">Memuat data alumni...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 bg-ugm-bg-light">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 text-ugm-main">
            Direktori Alumni Ilmu Komputer UGM
          </h1>
        </div>

        <div className="mb-8 rounded-xl p-8 border-2 border-ugm-blue shadow-xl bg-ugm-blue-soft flex flex-col items-center justify-center text-center">
          <h3 className="text-2xl font-bold text-ugm-light mb-3">
            Belum Terdaftar di Direktori Alumni?
          </h3>
          <p className="text-blue-50 text-base mb-6 max-w-2xl">
            Isi survey untuk bergabung dengan jaringan alumni Ilmu Komputer UGM
          </p>
          <Link
            href="/alumni/survey-alumni-ilmu-komputer"
            className="inline-flex items-center mt-2 px-8 py-3.5 bg-white hover:bg-gray-50 text-ugm-blue font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Isi Survey Sekarang
          </Link>
        </div>

        {/* Simple Filter */}
        <div className="mb-8 rounded-xl p-6 border-2 border-ugm-border-subtle bg-white shadow-md">
          <h2 className="text-lg font-bold text-ugm-main mb-4">Filter Alumni</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Name */}
            <div>
              <label htmlFor="searchName" className="block text-md font-bold mb-2 text-ugm-main">
                Cari Nama
              </label>
              <input
                type="text"
                id="searchName"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Masukkan nama..."
                className="w-full px-4 py-2.5 border-2 border-ugm-border-subtle bg-white text-ugm-main placeholder:text-ugm-light rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ugm-blue focus:border-ugm-blue"
              />
            </div>

            {/* Filter by Batch */}
            <div>
              <label htmlFor="filterBatch" className="block text-md font-bold mb-2 text-ugm-main">
                Filter Angkatan
              </label>
              <select
                id="filterBatch"
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-ugm-border-subtle bg-white text-ugm-main placeholder:text-ugm-light rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ugm-blue focus:border-ugm-blue"
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
            <div className="flex items-end">
              <button
                onClick={handleResetSimpleFilters}
                className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 border-2 border-ugm-border-subtle bg-ugm-bg-subtle text-ugm-main font-semibold hover:bg-gray-200 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ugm-blue focus:ring-offset-2"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Filter Info */}
          {(searchName || filterBatch) && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <svg
                className="w-5 h-5 text-ugm-blue shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-ugm-main">
                Filter aktif: {searchName && `Nama: "${searchName}"`}
                {searchName && filterBatch && ' • '}
                {filterBatch && `Angkatan: ${filterBatch}`}
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border-2 border-ugm-status-danger bg-red-50">
            <p className="text-ugm-status-danger font-medium">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 text-center">
          <p className="text-ugm-muted text-base">
            Menampilkan <span className="font-bold text-ugm-main">{filteredAlumni.length}</span>
            {alumni.length !== filteredAlumni.length && (
              <span className="text-ugm-main"> dari {alumni.length}</span>
            )}{' '}
            alumni
          </p>
        </div>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((person) => (
            <AlumniCard key={person.id} alumni={person} />
          ))}
        </div>

        {/* Empty State */}
        {filteredAlumni.length === 0 && initialized && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center border-4 border-ugm-border-subtle bg-ugm-bg-subtle">
              <svg
                className="w-12 h-12 text-ugm-light"
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
            <h3 className="text-xl font-bold mb-2 text-ugm-main">Tidak ada alumni ditemukan</h3>
            <p className="text-ugm-light mb-6 text-base">
              {searchName || filterBatch
                ? 'Tidak ada alumni yang sesuai dengan kriteria filter'
                : 'Belum ada data alumni'}
            </p>
            {(searchName || filterBatch) && (
              <button
                onClick={handleResetSimpleFilters}
                className="px-6 py-3 rounded-lg transition-all bg-ugm-blue text-white font-bold hover:bg-ugm-blue-soft shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-ugm-blue focus:ring-offset-2"
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
