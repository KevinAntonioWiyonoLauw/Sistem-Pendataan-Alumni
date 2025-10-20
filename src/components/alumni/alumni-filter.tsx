'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

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

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters, search: searchTerm }
        onFilterChange(newFilters)
        return newFilters
      })
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, onFilterChange])

  const handleFilterChange = useCallback(
    (key: keyof FilterOptions, value: string) => {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters, [key]: value }
        onFilterChange(newFilters)
        return newFilters
      })
    },
    [onFilterChange],
  )

  const clearFilters = useCallback(() => {
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
  }, [onFilterChange])

  const hasActiveFilters = Object.values(filters).some((value) => value !== '')
  const sortedBatches = [...batches].sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <div className="bg-gray-800 text-white rounded-2xl shadow-2xl p-8 border border-gray-700">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h3 className="text-xl font-bold tracking-tight text-white">Filter Alumni</h3>
        <Link href="/alumni/registrasi">
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-500 transition-all duration-200">
            + Daftar Alumni
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Cari Alumni</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email, perusahaan, atau posisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 text-white placeholder-gray-400 transition-all duration-200"
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

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          {
            label: 'Angkatan',
            key: 'batch',
            options: sortedBatches.map((b) => `Angkatan ${b}`),
            values: sortedBatches,
          },
          { label: 'Lokasi', key: 'city', options: cities, values: cities },
          {
            label: 'Bidang Pekerjaan',
            key: 'workField',
            options: workFields.map((f) => workFieldLabels[f] || f),
            values: workFields,
          },
          {
            label: 'Perusahaan/Instansi',
            key: 'currentEmployer',
            options: employers,
            values: employers,
          },
          { label: 'Posisi/Jabatan', key: 'position', options: positions, values: positions },
        ].map(({ label, key, options, values }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <select
              value={filters[key as keyof FilterOptions]}
              onChange={(e) => handleFilterChange(key as keyof FilterOptions, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-pointer focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 transition-all duration-200"
            >
              <option value="">Semua {label}</option>
              {options.map((option, i) => (
                <option key={option} value={values[i]}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-all duration-200"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-700 mt-6">
          <span className="text-sm text-gray-400">Filter aktif:</span>
          {Object.entries(filters).map(
            ([key, value]) =>
              value && (
                <span
                  key={key}
                  className="px-2 py-1 text-sm rounded-md bg-blue-900/40 border border-blue-700 text-blue-300"
                >
                  {key}: {value}
                </span>
              ),
          )}
        </div>
      )}
    </div>
  )
}
