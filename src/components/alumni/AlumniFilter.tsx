'use client'

import { useState, useEffect } from 'react'

interface FilterOptions {
  batch: string
  city: string
  currentStatus: string
  institution: string // ✅ Tambah institution filter
  position: string // ✅ Tambah position filter
  search: string
}

interface AlumniFilterProps {
  onFilterChange: (filters: FilterOptions) => void
  batches: string[]
  cities: string[]
  institutions: string[] // ✅ Tambah institutions untuk dropdown
  positions: string[] // ✅ Tambah positions untuk dropdown
  loading?: boolean
}

export default function AlumniFilter({
  onFilterChange,
  batches,
  cities,
  institutions,
  positions,
  loading = false,
}: AlumniFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    batch: '',
    city: '',
    currentStatus: '',
    institution: '',
    position: '',
    search: '',
  })

  const [searchTerm, setSearchTerm] = useState('')

  // ✅ PERBAIKAN: Fix dependency array
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      const newFilters = { ...filters, search: searchTerm }
      setFilters(newFilters)
      onFilterChange(newFilters)
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, onFilterChange])

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const clearFilters = () => {
    const emptyFilters = {
      batch: '',
      city: '',
      currentStatus: '',
      institution: '', // ✅ Reset institution
      position: '', // ✅ Reset position
      search: '',
    }
    setFilters(emptyFilters)
    setSearchTerm('')
    onFilterChange(emptyFilters)
  }

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'working', label: 'Bekerja' },
    { value: 'studying', label: 'Melanjutkan Studi' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'job-seeking', label: 'Mencari Kerja' },
    { value: 'other', label: 'Lainnya' },
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filter Alumni</h3>
        {(filters.batch ||
          filters.city ||
          filters.currentStatus ||
          filters.institution ||
          filters.position ||
          filters.search) && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            Filter aktif
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cari Alumni</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, institusi, atau posisi..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ✅ Update grid untuk menampung filter baru */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filter Angkatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Angkatan</label>
            <select
              value={filters.batch}
              onChange={(e) => handleFilterChange('batch', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={loading}
            >
              <option value="">Semua Angkatan</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>
                  Angkatan {batch}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={loading}
            >
              <option value="">Semua Lokasi</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Pekerjaan</label>
            <select
              value={filters.currentStatus}
              onChange={(e) => handleFilterChange('currentStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={loading}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ TAMBAHAN: Filter Institusi/Perusahaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institusi/Perusahaan
            </label>
            <select
              value={filters.institution}
              onChange={(e) => handleFilterChange('institution', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={loading}
            >
              <option value="">Semua Institusi</option>
              {institutions.map((institution) => (
                <option key={institution} value={institution}>
                  {institution}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ TAMBAHAN: Filter Posisi/Jabatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posisi/Jabatan</label>
            <select
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={loading}
            >
              <option value="">Semua Posisi</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Reset Filter'}
            </button>
          </div>
        </div>

        {/* Active filters display */}
        {(filters.batch ||
          filters.city ||
          filters.currentStatus ||
          filters.institution ||
          filters.position ||
          filters.search) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">Filter aktif:</span>
            {filters.search && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                Pencarian: "{filters.search}"
              </span>
            )}
            {filters.batch && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md">
                Angkatan: {filters.batch}
              </span>
            )}
            {filters.city && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-md">
                Lokasi: {filters.city}
              </span>
            )}
            {filters.currentStatus && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-md">
                Status: {statusOptions.find((s) => s.value === filters.currentStatus)?.label}
              </span>
            )}
            {/* ✅ TAMBAHAN: Active filter chips untuk pekerjaan */}
            {filters.institution && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-md">
                Institusi: {filters.institution}
              </span>
            )}
            {filters.position && (
              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-sm rounded-md">
                Posisi: {filters.position}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
