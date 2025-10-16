// src/components/alumni/AlumniFilter.tsx
'use client'

import { useState, useEffect } from 'react'

interface FilterOptions {
  batch: string
  city: string
  workField: string
  currentEmployer: string
  position: string
  search: string
}

interface AlumniFilterProps {
  onFilterChange: (filters: FilterOptions) => void
  batches: string[]
  cities: string[]
  workFields: string[]
  employers: string[]
  positions: string[]
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

export default function AlumniFilter({
  onFilterChange,
  batches,
  cities,
  workFields,
  employers,
  positions,
}: AlumniFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    batch: '',
    city: '',
    workField: '',
    currentEmployer: '',
    position: '',
    search: '',
  })

  const [searchTerm, setSearchTerm] = useState('')

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      const newFilters = { ...filters, search: searchTerm }
      setFilters(newFilters)
      onFilterChange(newFilters)
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      batch: '',
      city: '',
      workField: '',
      currentEmployer: '',
      position: '',
      search: '',
    }
    setFilters(emptyFilters)
    setSearchTerm('')
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== '')

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filter Alumni</h3>
        {hasActiveFilters && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            Filter aktif
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cari Alumni</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, perusahaan, atau posisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Batch Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Angkatan</label>
            <select
              value={filters.batch}
              onChange={(e) => handleFilterChange('batch', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Angkatan</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>
                  Angkatan {batch}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Lokasi</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Work Field Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bidang Pekerjaan</label>
            <select
              value={filters.workField}
              onChange={(e) => handleFilterChange('workField', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Bidang</option>
              {workFields.map((field) => (
                <option key={field} value={field}>
                  {workFieldLabels[field] || field}
                </option>
              ))}
            </select>
          </div>

          {/* Employer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perusahaan/Instansi
            </label>
            <select
              value={filters.currentEmployer}
              onChange={(e) => handleFilterChange('currentEmployer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Perusahaan</option>
              {employers.map((employer) => (
                <option key={employer} value={employer}>
                  {employer}
                </option>
              ))}
            </select>
          </div>

          {/* Position Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posisi/Jabatan</label>
            <select
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
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
            {filters.workField && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-md">
                Bidang: {workFieldLabels[filters.workField] || filters.workField}
              </span>
            )}
            {filters.currentEmployer && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-md">
                Perusahaan: {filters.currentEmployer}
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
